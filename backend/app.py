import os
import dash
from dash import dcc, html, Input, Output, State, no_update
import dash_bootstrap_components as dbc
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime
from functools import lru_cache
from flask import Flask, request, jsonify, send_from_directory
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import json
import numpy as np
from werkzeug.utils import secure_filename

# Import pybaseball functions
try:
    from pybaseball import (
        statcast_pitcher, statcast_batter, chadwick_register, 
        pitching_stats, batting_stats, playerid_lookup
    )
    PYBASEBALL_AVAILABLE = True
except ImportError:
    print("Warning: pybaseball not available. Install with: pip install pybaseball")
    PYBASEBALL_AVAILABLE = False

# --- Flask Server and Authentication Setup ---
server = Flask(__name__)
server.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', os.urandom(24).hex())
server.config['UPLOAD_FOLDER'] = 'uploads'
server.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(server.config['UPLOAD_FOLDER'], exist_ok=True)

CORS(server)
CORS(server, origins=["https://your-frontend-service.onrender.com"])

class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username

USERS = {
    "1": {"username": "admin", "password": generate_password_hash("password123")},
    "2": {"username": "coach", "password": generate_password_hash("push_performance")}
}
USERNAME_TO_ID = {data["username"]: id for id, data in USERS.items()}

login_manager = LoginManager()
login_manager.init_app(server)
login_manager.login_view = "/login"

@login_manager.user_loader
def load_user(user_id):
    if user_id in USERS:
        return User(user_id, USERS[user_id]["username"])
    return None

# --- Data-Driven Weights and Modifiers ---
COUNT_WEIGHTS = {
    '0-0': {'is_hard_hit': 0.745, 'is_called_strike': 0.101, 'is_weak_contact': 0.078, 'is_whiff': 0.067, 'is_chase': 0.009},
    '0-1': {'is_hard_hit': 0.877, 'is_called_strike': 0.053, 'is_chase': 0.027, 'is_whiff': 0.023, 'is_weak_contact': 0.019},
    '0-2': {'is_hard_hit': 0.529, 'is_whiff': 0.349, 'is_called_strike': 0.119, 'is_chase': 0.002, 'is_weak_contact': 0.001},
    '1-0': {'is_hard_hit': 0.693, 'is_weak_contact': 0.124, 'is_called_strike': 0.087, 'is_whiff': 0.083, 'is_chase': 0.013},
    '1-1': {'is_hard_hit': 0.858, 'is_called_strike': 0.049, 'is_weak_contact': 0.032, 'is_chase': 0.031, 'is_whiff': 0.030},
    '1-2': {'is_hard_hit': 0.511, 'is_whiff': 0.350, 'is_called_strike': 0.126, 'is_weak_contact': 0.011, 'is_chase': 0.003},
    '2-0': {'is_hard_hit': 0.418, 'is_weak_contact': 0.248, 'is_called_strike': 0.185, 'is_whiff': 0.120, 'is_chase': 0.030},
    '2-1': {'is_hard_hit': 0.655, 'is_weak_contact': 0.127, 'is_called_strike': 0.107, 'is_whiff': 0.082, 'is_chase': 0.029},
    '2-2': {'is_whiff': 0.478, 'is_hard_hit': 0.310, 'is_called_strike': 0.164, 'is_weak_contact': 0.043, 'is_chase': 0.006},
    '3-0': {'is_called_strike': 0.759, 'is_weak_contact': 0.146, 'is_whiff': 0.053, 'is_hard_hit': 0.033, 'is_chase': 0.009},
    '3-1': {'is_weak_contact': 0.433, 'is_called_strike': 0.249, 'is_whiff': 0.199, 'is_chase': 0.064, 'is_hard_hit': 0.054},
    '3-2': {'is_whiff': 0.485, 'is_called_strike': 0.294, 'is_weak_contact': 0.169, 'is_chase': 0.029, 'is_hard_hit': 0.022}
}

COUNT_DIFFICULTY_MODIFIER = {
    '0-0': 0.85, '0-1': 0.8, '0-2': 0.95,
    '1-0': 0.85, '1-1': 0.8, '1-2': 0.95,
    '2-0': 0.9, '2-1': 0.85, '2-2': 1.0,
    '3-0': 1.0, '3-1': 1.0, '3-2': 1.0
}

# --- MLB Player Database ---
PUSH_PERFORMANCE_PITCHERS = {
    "Garrett Crochet": {"id": 676979, "level": "MLB"},
    "Logan Webb": {"id": 657277, "level": "MLB"},
    "Bailey Falter": {"id": 663559, "level": "MLB"},
    "Kevin Gausman": {"id": 592332, "level": "MLB"},
    "Erick Fedde": {"id": 607200, "level": "MLB"},
    "Luke Little": {"id": 681432, "level": "MLB"},
    "Tylor Megill": {"id": 656731, "level": "MLB"},
    "Jack O'Loughlin": {"id": 681026, "level": "MiLB"},
    "Alek Jacob": {"id": 676951, "level": "MiLB"},
    "Gabriel Hughes": {"id": 693331, "level": "MiLB"},
    "Kevin Gowdy": {"id": 656484, "level": "MiLB"},
    "Nolan Hoffman": {"id": 687834, "level": "MiLB"}
}
ID_TO_NAME_MAP = {v['id']: k for k, v in PUSH_PERFORMANCE_PITCHERS.items()}

# --- Data Processing Functions ---
def get_pitcher_options(league):
    filtered_pitchers = {
        name: data for name, data in PUSH_PERFORMANCE_PITCHERS.items() if data['level'].upper() == league.upper()
    }
    return [{'label': name, 'value': data['id']} for name, data in filtered_pitchers.items()]

@lru_cache(maxsize=20)
def get_batter_id(batter_name_str):
    if not PYBASEBALL_AVAILABLE:
        return None, "pybaseball not available"
    
    if not batter_name_str or len(batter_name_str.split()) < 2:
        return None, "Invalid name"
    try:
        parts = batter_name_str.split()
        last_name = parts[-1]
        first_name = " ".join(parts[:-1])
        lookup = playerid_lookup(last_name, first_name)
        if not lookup.empty:
            return lookup['key_mlbam'].iloc[0], None
        return None, "Player not found"
    except Exception as e:
        return None, f"Lookup error: {e}"

@lru_cache(maxsize=50)
def get_statcast_data(player_id, years_tuple, player_type):
    if not PYBASEBALL_AVAILABLE:
        return pd.DataFrame()
    
    all_data = []
    for year in years_tuple:
        start_date, end_date = f'{year}-03-01', f'{year}-11-30'
        print(f"--- Fetching {player_type} data for ID {player_id} in {year} ---")
        if player_type == 'pitcher':
            df = statcast_pitcher(start_date, end_date, player_id)
        else: # batter
            df = statcast_batter(start_date, end_date, player_id)
        if not df.empty:
            all_data.append(df)
    
    if not all_data:
        return pd.DataFrame()
    
    return preprocess_all_metrics(pd.concat(all_data, ignore_index=True))

def preprocess_all_metrics(df):
    required_cols = {'description': '', 'zone': np.nan, 'launch_speed': np.nan, 'balls': '0', 'strikes': '0', 'events': '', 'woba_value': 0.0, 'est_slg_g': 0.0, 'p_throws': 'R', 'stand': 'R'}
    for col, default in required_cols.items():
        if col not in df.columns:
            df[col] = default
    df['zone'] = pd.to_numeric(df['zone'], errors='coerce')
    df['in_zone'] = df['zone'].isin(range(1, 10))
    df['out_of_zone'] = df['zone'].isin([11, 12, 13, 14])
    swing_descriptions = ['foul', 'foul_tip', 'hit_into_play', 'swinging_strike', 'swinging_strike_blocked', 'foul_bunt']
    whiff_descriptions = ['swinging_strike', 'swinging_strike_blocked']
    df['swing'] = df['description'].isin(swing_descriptions)
    df['whiff'] = df['description'].isin(whiff_descriptions)
    df['in_zone_swing'] = df['in_zone'] & df['swing']
    df['in_zone_whiff'] = df['in_zone'] & df['whiff']
    df['chase'] = df['out_of_zone'] & df['swing']
    df['is_ab_over'] = df['events'].notna() & (df['events'] != '')
    df['woba_value'] = pd.to_numeric(df['woba_value'], errors='coerce').fillna(0)
    df['launch_speed'] = pd.to_numeric(df['launch_speed'], errors='coerce')
    df['is_weak_contact'] = ((df['launch_speed'] < 85) & (df['description'] == 'hit_into_play')).fillna(False)
    df['is_hard_hit'] = ((df['launch_speed'] >= 95) & (df['description'] == 'hit_into_play')).fillna(False)
    df['bip'] = df['description'].isin(['hit_into_play', 'hit_into_play_no_out', 'hit_into_play_score'])
    df['count'] = df['balls'].astype(str) + '-' + df['strikes'].astype(str)
    df['is_called_strike'] = (df['description'] == 'called_strike').fillna(False)
    return df

def generate_recommendation_report(analysis_df, min_pitches=10, top_n=3):
    if analysis_df.empty: return pd.DataFrame()
    all_count_reports = []
    for count_str, weights in COUNT_WEIGHTS.items():
        balls, strikes = map(int, count_str.split('-'))
        count_df = analysis_df[(analysis_df['balls'] == balls) & (analysis_df['strikes'] == strikes)]
        if count_df.empty: continue
        agg_spec = {'whiff': ('whiff', 'sum'), 'swing': ('swing', 'sum'), 'chase': ('chase', 'sum'),'out_of_zone': ('out_of_zone', 'sum'),'weak_contact': ('is_weak_contact', 'sum'),'hard_hit': ('is_hard_hit', 'sum'),'bip': ('bip', 'sum'),'called_strike': ('is_called_strike', 'sum'),'pitches': ('pitch_type', 'count')}
        report = count_df.groupby('pitch_type').agg(**agg_spec).reset_index()
        report = report[report['pitches'] >= min_pitches].copy()
        if report.empty: continue
        report['whiff_rate'] = np.divide(report['whiff'], report['swing'], out=np.zeros_like(report['whiff'], dtype=float), where=report['swing']!=0)
        report['chase_rate'] = np.divide(report['chase'], report['out_of_zone'], out=np.zeros_like(report['chase'], dtype=float), where=report['out_of_zone']!=0)
        report['weak_contact_rate'] = np.divide(report['weak_contact'], report['bip'], out=np.zeros_like(report['weak_contact'], dtype=float), where=report['bip']!=0)
        report['hard_hit_rate'] = np.divide(report['hard_hit'], report['bip'], out=np.zeros_like(report['hard_hit'], dtype=float), where=report['bip']!=0)
        report['called_strike_rate'] = np.divide(report['called_strike'], report['pitches'], out=np.zeros_like(report['called_strike'], dtype=float), where=report['pitches']!=0)
        report['raw_score'] = ((report['whiff_rate'] * weights.get('is_whiff', 0)) + (report['chase_rate'] * weights.get('is_chase', 0)) + (report['weak_contact_rate'] * weights.get('is_weak_contact', 0)) + (report['called_strike_rate'] * weights.get('is_called_strike', 0)) - (report['hard_hit_rate'] * weights.get('is_hard_hit', 0)))
        
        # Apply the new hybrid scaling logic
        if len(report) > 1:
            min_score, max_score = report['raw_score'].min(), report['raw_score'].max()
            if max_score > min_score: 
                report['score'] = 1 + ((report['raw_score'] - min_score) * 9) / (max_score - min_score)
            else: 
                report['score'] = 5.0
        else: 
            report['score'] = 5.0
        
        # Apply the count difficulty modifier
        modifier = COUNT_DIFFICULTY_MODIFIER.get(count_str, 1.0)
        report['score'] = report['score'] * modifier
        
        report['count'] = count_str
        report.sort_values(by='score', ascending=False, inplace=True)
        all_count_reports.append(report.head(top_n))
    if not all_count_reports: return pd.DataFrame()
    return pd.concat(all_count_reports, ignore_index=True)

# --- API Routes ---
@server.route('/api/pitchers/<league>')
def get_pitchers(league):
    """Get available pitchers for a given league"""
    try:
        options = get_pitcher_options(league)
        return jsonify(options)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@server.route('/api/analyze', methods=['POST'])
def analyze_pitcher():
    """Generate pitch recommendation analysis"""
    try:
        data = request.get_json()
        pitcher_id = data.get('pitcher_id')
        years = data.get('years', [])
        opponent_type = data.get('opponent_type', 'average')
        batter_name = data.get('batter_name', '')
        handedness = data.get('handedness', 'R')
        min_pitches = data.get('min_pitches', 10)
        
        if not pitcher_id or not years:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        pitcher_name = ID_TO_NAME_MAP.get(pitcher_id)
        if not pitcher_name:
            return jsonify({'error': 'Pitcher not found'}), 404
        
        pitcher_info = PUSH_PERFORMANCE_PITCHERS.get(pitcher_name, {})
        pitcher_level = pitcher_info.get('level', 'MLB')
        
        # Get pitcher data
        if pitcher_level == 'MiLB':
            # Load from CSV file
            csv_path = os.path.join(server.config['UPLOAD_FOLDER'], f'{pitcher_id}.csv')
            if not os.path.exists(csv_path):
                return jsonify({'error': f'MiLB data file not found for {pitcher_name}'}), 404
            pitcher_df = pd.read_csv(csv_path)
        else:
            # Get MLB data from pybaseball
            pitcher_df = get_statcast_data(pitcher_id, tuple(sorted(years)), 'pitcher')
        
        if pitcher_df.empty:
            return jsonify({'error': f'No data found for {pitcher_name}'}), 404
        
        pitcher_df = preprocess_all_metrics(pitcher_df)
        
        # Generate analysis based on opponent type
        if opponent_type == 'specific':
            if not batter_name:
                return jsonify({'error': 'Batter name required for specific analysis'}), 400
            
            batter_id, error_msg = get_batter_id(batter_name)
            if error_msg:
                return jsonify({'error': f'Batter lookup failed: {error_msg}'}), 400
            
            # Get batter data
            batter_df = get_statcast_data(batter_id, tuple(sorted(years)), 'batter')
            if batter_df.empty:
                return jsonify({'error': f'No batter data found for {batter_name}'}), 404
            
            pitcher_hand = pitcher_df['p_throws'].iloc[0]
            analysis_df = batter_df[batter_df['p_throws'] == pitcher_hand]
            opponent_name = batter_name.title()
        else:
            analysis_df = pitcher_df[pitcher_df['stand'] == handedness]
            opponent_name = f"Avg {handedness}HH Batter"
        
        # Generate recommendations
        report_df = generate_recommendation_report(analysis_df, min_pitches)
        
        if report_df.empty:
            return jsonify({'error': 'Not enough data to generate recommendations'}), 400
        
        # Convert to JSON-serializable format
        recommendations = []
        for _, row in report_df.iterrows():
            rec = {
                'pitch_type': row['pitch_type'],
                'count': row['count'],
                'score': float(row['score']),
                'pitches': int(row['pitches']),
                'whiff_rate': float(row['whiff_rate']),
                'hard_hit_rate': float(row['hard_hit_rate']),
                'called_strike_rate': float(row['called_strike_rate']),
                'weak_contact_rate': float(row.get('weak_contact_rate', 0)),
                'chase_rate': float(row.get('chase_rate', 0))
            }
            recommendations.append(rec)
        
        result = {
            'pitcher_name': pitcher_name,
            'opponent_name': opponent_name,
            'years': years,
            'league': pitcher_level,
            'total_pitches': int(pitcher_df.shape[0]),
            'recommendations': recommendations
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({'error': str(e)}), 500

@server.route('/api/upload-milb', methods=['POST'])
def upload_milb_data():
    """Upload MiLB CSV data for a pitcher"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        pitcher_id = request.form.get('pitcher_id')
        
        if not pitcher_id:
            return jsonify({'error': 'Pitcher ID required'}), 400
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Only CSV files allowed'}), 400
        
        # Save file
        filename = secure_filename(f'{pitcher_id}.csv')
        filepath = os.path.join(server.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Validate CSV structure
        try:
            df = pd.read_csv(filepath)
            required_columns = ['pitch_type', 'description', 'balls', 'strikes', 'events']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                os.remove(filepath)
                return jsonify({'error': f'Missing required columns: {missing_columns}'}), 400
        except Exception as e:
            os.remove(filepath)
            return jsonify({'error': f'Invalid CSV file: {str(e)}'}), 400
        
        return jsonify({'message': 'MiLB data uploaded successfully', 'pitcher_id': pitcher_id})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@server.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'pybaseball_available': PYBASEBALL_AVAILABLE})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    server.run(debug=False, host='0.0.0.0', port=port) 
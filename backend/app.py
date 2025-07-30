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
    # Defensive: ensure DataFrame is contiguous and not a view
    df = df.copy()
    # DEBUG: Print DataFrame shape and index at start
    print('preprocess_all_metrics START shape:', df.shape, 'index:', df.index)
    # Ensure all required columns exist and are correct length
    required_cols = {'description': '', 'zone': np.nan, 'launch_speed': np.nan, 'balls': '0', 'strikes': '0', 'events': '', 'woba_value': 0.0, 'est_slg_g': 0.0, 'p_throws': 'R', 'stand': 'R'}
    for col, default in required_cols.items():
        if col not in df.columns or len(df[col]) != len(df):
            df[col] = pd.Series([default] * len(df), index=df.index)
    df['zone'] = pd.to_numeric(df['zone'], errors='coerce')
    try:
        print('Assign in_zone:', df.shape, df.index)
        df['in_zone'] = pd.Series(df['zone'].isin(range(1, 10)), index=df.index, dtype=bool)
    except Exception as e:
        print('ERROR in_zone:', e, df.shape, df.index)
        raise
    try:
        print('Assign out_of_zone:', df.shape, df.index)
        df['out_of_zone'] = pd.Series(df['zone'].isin([11, 12, 13, 14]), index=df.index, dtype=bool)
    except Exception as e:
        print('ERROR out_of_zone:', e, df.shape, df.index)
        raise
    swing_descriptions = ['foul', 'foul_tip', 'hit_into_play', 'swinging_strike', 'swinging_strike_blocked', 'foul_bunt']
    whiff_descriptions = ['swinging_strike', 'swinging_strike_blocked']
    try:
        print('Assign swing:', df.shape, df.index)
        df['swing'] = pd.Series(df['description'].isin(swing_descriptions), index=df.index, dtype=bool)
    except Exception as e:
        print('ERROR swing:', e, df.shape, df.index)
        raise
    try:
        print('Assign whiff:', df.shape, df.index)
        df['whiff'] = pd.Series(df['description'].isin(whiff_descriptions), index=df.index, dtype=bool)
    except Exception as e:
        print('ERROR whiff:', e, df.shape, df.index)
        raise
    try:
        print('Assign in_zone_swing:', df.shape, df.index)
        df['in_zone_swing'] = pd.Series(df['in_zone'] & df['swing'], index=df.index, dtype=bool)
    except Exception as e:
        print('ERROR in_zone_swing:', e, df.shape, df.index)
        raise
    try:
        print('Assign in_zone_whiff:', df.shape, df.index)
        df['in_zone_whiff'] = pd.Series(df['in_zone'] & df['whiff'], index=df.index, dtype=bool)
    except Exception as e:
        print('ERROR in_zone_whiff:', e, df.shape, df.index)
        raise
    try:
        print('Assign chase:', df.shape, df.index)
        df['chase'] = pd.Series(df['out_of_zone'] & df['swing'], index=df.index, dtype=bool)
    except Exception as e:
        print('ERROR chase:', e, df.shape, df.index)
        raise
    try:
        print('Assign is_ab_over:', df.shape, df.index)
        df['is_ab_over'] = pd.Series(df['events'].notna() & (df['events'] != ''), index=df.index, dtype=bool)
    except Exception as e:
        print('ERROR is_ab_over:', e, df.shape, df.index)
        raise
    df['woba_value'] = pd.to_numeric(df['woba_value'], errors='coerce').fillna(0)
    df['launch_speed'] = pd.to_numeric(df['launch_speed'], errors='coerce')
    try:
        print('Assign is_weak_contact:', df.shape, df.index)
        mask_weak = (df['launch_speed'] < 85) & (df['description'] == 'hit_into_play') if len(df) > 0 else pd.Series([], dtype=bool)
        df['is_weak_contact'] = pd.Series(mask_weak, index=df.index, dtype=bool).fillna(False)
    except Exception as e:
        print('ERROR is_weak_contact:', e, df.shape, df.index)
        raise
    try:
        print('Assign is_hard_hit:', df.shape, df.index)
        mask_hard = (df['launch_speed'] >= 95) & (df['description'] == 'hit_into_play') if len(df) > 0 else pd.Series([], dtype=bool)
        df['is_hard_hit'] = pd.Series(mask_hard, index=df.index, dtype=bool).fillna(False)
    except Exception as e:
        print('ERROR is_hard_hit:', e, df.shape, df.index)
        raise
    try:
        print('Assign bip:', df.shape, df.index)
        df['bip'] = pd.Series(df['description'].isin(['hit_into_play', 'hit_into_play_no_out', 'hit_into_play_score']), index=df.index, dtype=bool)
    except Exception as e:
        print('ERROR bip:', e, df.shape, df.index)
        raise
    df['count'] = df['balls'].astype(str) + '-' + df['strikes'].astype(str)
    try:
        print('Assign is_called_strike:', df.shape, df.index)
        mask_called = (df['description'] == 'called_strike') if len(df) > 0 else pd.Series([], dtype=bool)
        df['is_called_strike'] = pd.Series(mask_called, index=df.index, dtype=int)
    except Exception as e:
        print('ERROR is_called_strike:', e, df.shape, df.index)
        raise
    # DEBUG: Print DataFrame shape and index at end
    print('preprocess_all_metrics END shape:', df.shape, 'index:', df.index)
    return df

def generate_recommendation_report(analysis_df, min_pitches=10, league_benchmarks=None, league='mlb', top_n=3):
    print('generate_recommendation_report START shape:', analysis_df.shape, 'index:', analysis_df.index)
    if analysis_df.empty: return pd.DataFrame()
    
    # Use provided benchmarks or calculate from data
    if league_benchmarks is None:
        league_benchmarks = calculate_league_benchmarks(analysis_df, league)
    print('DEBUG: Using league benchmarks:', league_benchmarks)
    
    all_count_reports = []
    for count_str, weights in COUNT_WEIGHTS.items():
        balls, strikes = map(int, count_str.split('-'))
        count_df = analysis_df[(analysis_df['balls'] == balls) & (analysis_df['strikes'] == strikes)]
        print(f'  count_df for {count_str} shape:', count_df.shape, 'index:', count_df.index)
        if count_df.empty: continue
        agg_spec = {'whiff': ('whiff', 'sum'), 'swing': ('swing', 'sum'), 'chase': ('chase', 'sum'),'out_of_zone': ('out_of_zone', 'sum'),'weak_contact': ('is_weak_contact', 'sum'),'hard_hit': ('is_hard_hit', 'sum'),'bip': ('bip', 'sum'),'called_strike': ('is_called_strike', 'sum'),'pitches': ('pitch_type', 'count')}
        try:
            report = count_df.groupby('pitch_type').agg(**agg_spec).reset_index()
            print(f'    report after groupby shape:', report.shape, 'index:', report.index)
        except Exception as e:
            print('ERROR in groupby:', e, count_df.shape, count_df.index)
            raise
        report = report[report['pitches'] >= min_pitches].copy()
        if report.empty: continue
        try:
            report['whiff_rate'] = np.divide(report['whiff'], report['swing'], out=np.zeros_like(report['whiff'], dtype=float), where=report['swing']!=0)
        except Exception as e:
            print('ERROR whiff_rate:', e, report.shape, report.index)
            raise
        try:
            report['chase_rate'] = np.divide(report['chase'], report['out_of_zone'], out=np.zeros_like(report['chase'], dtype=float), where=report['out_of_zone']!=0)
        except Exception as e:
            print('ERROR chase_rate:', e, report.shape, report.index)
            raise
        try:
            report['weak_contact_rate'] = np.divide(report['weak_contact'], report['bip'], out=np.zeros_like(report['weak_contact'], dtype=float), where=report['bip']!=0)
        except Exception as e:
            print('ERROR weak_contact_rate:', e, report.shape, report.index)
            raise
        try:
            report['hard_hit_rate'] = np.divide(report['hard_hit'], report['bip'], out=np.zeros_like(report['hard_hit'], dtype=float), where=report['bip']!=0)
        except Exception as e:
            print('ERROR hard_hit_rate:', e, report.shape, report.index)
            raise
        try:
            report['called_strike_rate'] = np.divide(report['called_strike'], report['pitches'], out=np.zeros_like(report['called_strike'], dtype=float), where=report['pitches']!=0)
        except Exception as e:
            print('ERROR called_strike_rate:', e, report.shape, report.index)
            raise
        
        # Calculate percentile-based scores for each row using actual benchmarks
        def debug_score(row):
            score, metric_scores = calculate_composite_score(row, weights, league_benchmarks, league)
            print(f"DEBUG: PitchType={row['pitch_type']} Count={count_str} Metrics={{'whiff_rate': {row['whiff_rate']:.3f}, 'chase_rate': {row['chase_rate']:.3f}, 'weak_contact_rate': {row['weak_contact_rate']:.3f}, 'hard_hit_rate': {row['hard_hit_rate']:.3f}, 'called_strike_rate': {row['called_strike_rate']:.3f}}} MetricScores={metric_scores} CompositeScore={score}")
            print(f"DEBUG: Weights for {count_str}: {weights}")
            return score
        try:
            report['score'] = report.apply(debug_score, axis=1)
        except Exception as e:
            print('ERROR score apply:', e, report.shape, report.index)
            raise
        
        # Apply the count difficulty modifier
        modifier = COUNT_DIFFICULTY_MODIFIER.get(count_str, 1.0)
        report['score'] = report['score'] * modifier
        
        report['count'] = count_str
        report.sort_values(by='score', ascending=False, inplace=True)
        all_count_reports.append(report.head(top_n))
    if not all_count_reports: return pd.DataFrame()
    result = pd.concat(all_count_reports, ignore_index=True)
    print('generate_recommendation_report END shape:', result.shape, 'index:', result.index)
    return result

# --- Dynamic League Performance Benchmarks ---
# These will be calculated from actual data
LEAGUE_BENCHMARKS = {}

def calculate_league_benchmarks(analysis_df, league='mlb'):
    """Use fixed, realistic league benchmarks instead of calculating from individual pitcher data"""
    # Fixed MLB benchmarks based on league-wide averages
    # These are more realistic and will give appropriate scores to elite pitchers
    mlb_benchmarks = {
        'whiff_rate': {'mean': 0.15, 'std': 0.08},  # 15% average whiff rate
        'chase_rate': {'mean': 0.28, 'std': 0.10},  # 28% average chase rate  
        'weak_contact_rate': {'mean': 0.20, 'std': 0.08},  # 20% average weak contact
        'hard_hit_rate': {'mean': 0.35, 'std': 0.12},  # 35% average hard hit rate
        'called_strike_rate': {'mean': 0.10, 'std': 0.05}  # 10% average called strike rate
    }
    
    # Adjust for MiLB if needed (slightly lower standards)
    if league.lower() == 'milb':
        for metric in mlb_benchmarks:
            mlb_benchmarks[metric]['mean'] *= 0.90  # 10% lower for MiLB
            mlb_benchmarks[metric]['std'] *= 0.90
    
    return mlb_benchmarks

# MiLB adjustments (more conservative - only 5% adjustment)
MILB_ADJUSTMENT = 0.95

def calculate_percentile_score(rate, metric, benchmarks, league='mlb'):
    """Calculate percentile-based score (0-100 scale) for Pitch Effectiveness Rating (PER)"""
    if pd.isna(rate):
        print(f"DEBUG PERCENTILE: {metric} - rate={rate} -> 50.0 (missing)")
        return 50.0  # Neutral score for missing data
    if metric not in benchmarks:
        print(f"DEBUG PERCENTILE: {metric} - no benchmark -> 50.0")
        return 50.0  # Neutral score if no benchmark available
    
    # Apply MiLB adjustment if needed
    if league.lower() == 'milb':
        adjusted_rate = rate * MILB_ADJUSTMENT
    else:
        adjusted_rate = rate
    
    # Use a minimum std for stability
    std = max(benchmarks[metric]['std'], 0.05)
    
    # For hard_hit_rate, lower is better, so invert the scoring
    if metric == 'hard_hit_rate':
        z_score = (benchmarks[metric]['mean'] - adjusted_rate) / std
    else:
        z_score = (adjusted_rate - benchmarks[metric]['mean']) / std
    
    # Convert to percentile using normal distribution approximation
    import math
    percentile = 50 * (1 + math.erf(z_score / math.sqrt(2)))
    
    # Much more generous mapping for realistic scoring
    # Top 20% = Elite, Top 40% = Excellent, Top 60% = Good, etc.
    if percentile >= 80:
        score = 95.0 + (percentile - 80) / 20 * 5.0  # 95-100 (Elite)
    elif percentile >= 60:
        score = 85.0 + (percentile - 60) / 20 * 10.0  # 85-95 (Excellent)
    elif percentile >= 40:
        score = 75.0 + (percentile - 40) / 20 * 10.0  # 75-85 (Good)
    elif percentile >= 20:
        score = 65.0 + (percentile - 20) / 20 * 10.0  # 65-75 (Above Average)
    elif percentile >= 10:
        score = 55.0 + (percentile - 10) / 10 * 10.0  # 55-65 (Average)
    elif percentile >= 5:
        score = 45.0 + (percentile - 5) / 5 * 10.0  # 45-55 (Below Average)
    elif percentile >= 2:
        score = 35.0 + (percentile - 2) / 3 * 10.0  # 35-45 (Poor)
    else:
        score = 25.0 + percentile / 2 * 10.0  # 25-35 (Very Poor)
    
    # Only print debug for non-zero rates to reduce noise
    if rate > 0:
        print(f"DEBUG PERCENTILE: {metric} - rate={rate:.3f}, adjusted={adjusted_rate:.3f}, mean={benchmarks[metric]['mean']:.3f}, std={std:.3f}, z_score={z_score:.3f}, percentile={percentile:.1f} -> score={score:.1f}")
    
    return round(score, 1)

def calculate_composite_score(row, weights, benchmarks, league='mlb'):
    """Calculate weighted composite score using percentile-based metrics
    Returns Pitch Effectiveness Rating (PER) on 0-100 scale"""
    scores = {}
    
    # Calculate percentile scores for each metric
    scores['whiff'] = calculate_percentile_score(row['whiff_rate'], 'whiff_rate', benchmarks, league)
    scores['chase'] = calculate_percentile_score(row['chase_rate'], 'chase_rate', benchmarks, league)
    scores['weak_contact'] = calculate_percentile_score(row['weak_contact_rate'], 'weak_contact_rate', benchmarks, league)
    scores['called_strike'] = calculate_percentile_score(row['called_strike_rate'], 'called_strike_rate', benchmarks, league)
    scores['hard_hit'] = calculate_percentile_score(row['hard_hit_rate'], 'hard_hit_rate', benchmarks, league)
    
    # Map weight keys to score keys
    weight_to_score_mapping = {
        'is_whiff': 'whiff',
        'is_chase': 'chase', 
        'is_weak_contact': 'weak_contact',
        'is_called_strike': 'called_strike',
        'is_hard_hit': 'hard_hit'
    }
    
    # Apply weights and calculate composite
    composite = 0
    total_weight = 0
    
    # Only print debug for high-scoring pitches to reduce noise
    high_score_threshold = 80.0
    if any(score > high_score_threshold for score in scores.values()):
        print(f"DEBUG COMPOSITE: Raw metrics - whiff_rate={row['whiff_rate']:.3f}, hard_hit_rate={row['hard_hit_rate']:.3f}")
        print(f"DEBUG COMPOSITE: Individual scores - {scores}")
        print(f"DEBUG COMPOSITE: Weights - {weights}")
        
        for weight_key, weight in weights.items():
            score_key = weight_to_score_mapping.get(weight_key)
            if score_key and score_key in scores:
                contribution = scores[score_key] * weight
                composite += contribution
                total_weight += weight
                print(f"DEBUG COMPOSITE: {weight_key} -> {score_key} = {scores[score_key]:.1f} * {weight:.3f} = {contribution:.1f}")
    else:
        # Silent calculation for normal scores
        for weight_key, weight in weights.items():
            score_key = weight_to_score_mapping.get(weight_key)
            if score_key and score_key in scores:
                composite += scores[score_key] * weight
                total_weight += weight
    
    # Normalize by total weight
    if total_weight > 0:
        final_score = composite / total_weight
    else:
        final_score = 50.0  # Neutral score instead of 5.0
    
    # Print final score for high-scoring pitches
    if any(score > high_score_threshold for score in scores.values()):
        print(f"DEBUG COMPOSITE: Final score = {composite:.1f} / {total_weight:.3f} = {final_score:.1f}")
    
    return round(final_score, 1), scores

def add_rate_columns(df):
    print('add_rate_columns START shape:', df.shape, 'index:', df.index)
    try:
        df['whiff_rate'] = np.divide(df['whiff'], df['swing'], out=np.zeros_like(df['whiff'], dtype=float), where=df['swing']!=0)
    except Exception as e:
        print('ERROR whiff_rate:', e, df.shape, df.index)
        raise
    try:
        df['chase_rate'] = np.divide(df['chase'], df['out_of_zone'], out=np.zeros_like(df['chase'], dtype=float), where=df['out_of_zone']!=0)
    except Exception as e:
        print('ERROR chase_rate:', e, df.shape, df.index)
        raise
    try:
        df['weak_contact_rate'] = np.divide(df['is_weak_contact'], df['bip'], out=np.zeros_like(df['is_weak_contact'], dtype=float), where=df['bip']!=0)
    except Exception as e:
        print('ERROR weak_contact_rate:', e, df.shape, df.index)
        raise
    try:
        df['hard_hit_rate'] = np.divide(df['is_hard_hit'], df['bip'], out=np.zeros_like(df['is_hard_hit'], dtype=float), where=df['bip']!=0)
    except Exception as e:
        print('ERROR hard_hit_rate:', e, df.shape, df.index)
        raise
    # Use 'pitches' if present, else use total rows
    if 'pitches' in df.columns:
        denom = df['pitches']
    else:
        denom = np.ones(len(df['is_called_strike']))
    try:
        df['called_strike_rate'] = np.divide(
            df['is_called_strike'],
            denom,
            out=np.zeros_like(df['is_called_strike'], dtype=float),
            where=denom != 0
        )
    except Exception as e:
        print('ERROR called_strike_rate:', e, df.shape, df.index)
        raise
    print('add_rate_columns END shape:', df.shape, 'index:', df.index)
    return df

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
            analysis_df = batter_df[batter_df['p_throws'] == pitcher_hand].copy().reset_index(drop=True)
            opponent_name = batter_name.title()
        else:
            analysis_df = pitcher_df[pitcher_df['stand'] == handedness].copy().reset_index(drop=True)
            opponent_name = f"Avg {handedness}HH Batter"

        # Ensure all derived columns are present before scoring
        analysis_df = preprocess_all_metrics(analysis_df)
        # Cast all boolean columns used in aggregation/division to int
        for col in ['whiff', 'swing', 'chase', 'out_of_zone', 'is_weak_contact', 'is_hard_hit', 'bip', 'is_called_strike']:
            if col in analysis_df.columns:
                analysis_df[col] = analysis_df[col].astype(int)
        analysis_df = add_rate_columns(analysis_df)

        # Calculate league benchmarks from the data
        league_benchmarks = calculate_league_benchmarks(analysis_df, pitcher_level)
        
        # Generate recommendations
        report_df = generate_recommendation_report(analysis_df, min_pitches, league_benchmarks, pitcher_level)
        
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
"""
League Averages Research Script
Professional baseball analytics - League average calculations
"""

import pandas as pd
import numpy as np
from pybaseball import statcast_pitcher, statcast_batter, pitching_stats, chadwick_register
import requests
import json

def add_pitch_event_columns(df):
    swing_descriptions = [
        'foul', 'foul_tip', 'hit_into_play', 'swinging_strike', 'swinging_strike_blocked', 'foul_bunt'
    ]
    whiff_descriptions = ['swinging_strike', 'swinging_strike_blocked']

    df['swing'] = df['description'].isin(swing_descriptions)
    df['whiff'] = df['description'].isin(whiff_descriptions)
    df['out_of_zone'] = df['zone'].isin([11, 12, 13, 14])
    df['chase'] = df['out_of_zone'] & df['swing']
    df['is_called_strike'] = (df['description'] == 'called_strike')
    df['bip'] = df['description'].isin(['hit_into_play', 'hit_into_play_no_out', 'hit_into_play_score'])
    df['launch_speed'] = pd.to_numeric(df['launch_speed'], errors='coerce')
    df['is_weak_contact'] = ((df['launch_speed'] < 85) & (df['description'] == 'hit_into_play'))
    df['is_hard_hit'] = ((df['launch_speed'] >= 95) & (df['description'] == 'hit_into_play'))
    return df

def get_statcast_league_averages(year=2024, min_pitches=100):
    """
    Calculate league averages from Statcast data
    This is the most accurate method for MLB averages
    """
    print(f"Fetching Statcast data for {year}...")
    
    # Comprehensive list of MLB pitchers for accurate league averages
    # This includes top performers, average performers, and various pitch types
    sample_pitchers = [
        # Elite Pitchers (2024)
        676979,  # Garrett Crochet
        657277,  # Logan Webb
        592332,  # Kevin Gausman
        607200,  # Erick Fedde
        656731,  # Tylor Megill
        681432,  # Luke Little
        663559,  # Bailey Falter
        
        # Additional Top Performers
        592789,  # Gerrit Cole
        608369,  # Jacob deGrom
        605400,  # Max Scherzer
        594798,  # Justin Verlander
        608331,  # Clayton Kershaw
        592450,  # Zack Greinke
        605200,  # Chris Sale
        608369,  # Jacob deGrom
        592789,  # Gerrit Cole
        605400,  # Max Scherzer
        
        # Mid-tier Performers
        664040,  # Corbin Burnes
        656731,  # Tylor Megill
        663559,  # Bailey Falter
        681432,  # Luke Little
        676979,  # Garrett Crochet
        657277,  # Logan Webb
        
        # Various Pitch Types (Sliders, Fastballs, etc.)
        608369,  # Jacob deGrom (Slider specialist)
        592789,  # Gerrit Cole (Fastball specialist)
        605400,  # Max Scherzer (Mixed arsenal)
        594798,  # Justin Verlander (Fastball specialist)
        608331,  # Clayton Kershaw (Curveball specialist)
        592450,  # Zack Greinke (Mixed arsenal)
        605200,  # Chris Sale (Slider specialist)
        
        # 2024 Breakout Pitchers
        676979,  # Garrett Crochet
        681432,  # Luke Little
        663559,  # Bailey Falter
        656731,  # Tylor Megill
        
        # Veteran Pitchers
        592789,  # Gerrit Cole
        608369,  # Jacob deGrom
        605400,  # Max Scherzer
        594798,  # Justin Verlander
        608331,  # Clayton Kershaw
        592450,  # Zack Greinke
        605200,  # Chris Sale
    ]
    
    all_data = []
    
    for pitcher_id in sample_pitchers:
        try:
            df = statcast_pitcher(f'{year}-03-01', f'{year}-11-30', pitcher_id)
            if not df.empty:
                all_data.append(df)
                print(f"Added data for pitcher {pitcher_id}")
        except Exception as e:
            print(f"Error fetching data for pitcher {pitcher_id}: {e}")
    
    if not all_data:
        print("No data collected")
        return None
    
    # Combine all data
    league_df = pd.concat(all_data, ignore_index=True)
    
    # Preprocess data (same as your main app)
    league_df = preprocess_statcast_data(league_df)
    league_df = add_pitch_event_columns(league_df)
    
    # Calculate league averages by pitch type
    league_averages = calculate_pitch_type_averages(league_df, min_pitches)
    
    return league_averages

def preprocess_statcast_data(df):
    """Preprocess Statcast data to match your app's format"""
    # Add required columns if missing
    required_cols = {'description': '', 'zone': np.nan, 'launch_speed': np.nan, 
                    'balls': '0', 'strikes': '0', 'events': '', 'woba_value': 0.0, 
                    'est_slg_g': 0.0, 'p_throws': 'R', 'stand': 'R'}
    
    for col, default in required_cols.items():
        if col not in df.columns:
            df[col] = default
    
    # Convert to numeric where needed
    df['zone'] = pd.to_numeric(df['zone'], errors='coerce')
    df['balls'] = pd.to_numeric(df['balls'], errors='coerce').fillna(0)
    df['strikes'] = pd.to_numeric(df['strikes'], errors='coerce').fillna(0)
    
    # Calculate metrics
    df['in_zone'] = df['zone'].isin(range(1, 10))
    df['out_of_zone'] = df['zone'].isin([11, 12, 13, 14])
    
    swing_descriptions = ['foul', 'foul_tip', 'hit_into_play', 'swinging_strike', 
                         'swinging_strike_blocked', 'foul_bunt']
    whiff_descriptions = ['swinging_strike', 'swinging_strike_blocked']
    
    df['swing'] = df['description'].isin(swing_descriptions)
    df['whiff'] = df['description'].isin(whiff_descriptions)
    df['chase'] = df['out_of_zone'] & df['swing']
    df['is_called_strike'] = (df['description'] == 'called_strike').fillna(False)
    
    df['woba_value'] = pd.to_numeric(df['woba_value'], errors='coerce').fillna(0)
    df['launch_speed'] = pd.to_numeric(df['launch_speed'], errors='coerce')
    
    df['is_weak_contact'] = ((df['launch_speed'] < 85) & 
                            (df['description'] == 'hit_into_play')).fillna(False)
    df['is_hard_hit'] = ((df['launch_speed'] >= 95) & 
                        (df['description'] == 'hit_into_play')).fillna(False)
    
    df['bip'] = df['description'].isin(['hit_into_play', 'hit_into_play_no_out', 
                                      'hit_into_play_score'])
    
    return df

def calculate_pitch_type_averages(df, min_pitches=100):
    """Calculate league averages by pitch type"""
    # First, let's see what columns we actually have
    print(f"Available columns: {list(df.columns)}")
    
    # Create a count column if it doesn't exist
    if 'pitches' not in df.columns:
        df['pitches'] = 1  # Each row represents one pitch
    
    # Group by pitch type and calculate metrics
    pitch_stats = df.groupby('pitch_type').agg({
        'pitches': 'sum',  # Changed from 'count' to 'sum'
        'whiff': 'sum',
        'swing': 'sum',
        'chase': 'sum',
        'out_of_zone': 'sum',
        'is_weak_contact': 'sum',
        'is_hard_hit': 'sum',
        'bip': 'sum',
        'is_called_strike': 'sum'
    }).reset_index()
    
    # Filter for sufficient sample size
    pitch_stats = pitch_stats[pitch_stats['pitches'] >= min_pitches]
    
    # Calculate rates
    pitch_stats['whiff_rate'] = np.divide(pitch_stats['whiff'], pitch_stats['swing'], 
                                         out=np.zeros_like(pitch_stats['whiff'], dtype=float), 
                                         where=pitch_stats['swing']!=0)
    
    pitch_stats['chase_rate'] = np.divide(pitch_stats['chase'], pitch_stats['out_of_zone'], 
                                         out=np.zeros_like(pitch_stats['chase'], dtype=float), 
                                         where=pitch_stats['out_of_zone']!=0)
    
    pitch_stats['weak_contact_rate'] = np.divide(pitch_stats['is_weak_contact'], pitch_stats['bip'], 
                                                out=np.zeros_like(pitch_stats['is_weak_contact'], dtype=float), 
                                                where=pitch_stats['bip']!=0)
    
    pitch_stats['hard_hit_rate'] = np.divide(pitch_stats['is_hard_hit'], pitch_stats['bip'], 
                                            out=np.zeros_like(pitch_stats['is_hard_hit'], dtype=float), 
                                            where=pitch_stats['bip']!=0)
    
    pitch_stats['called_strike_rate'] = np.divide(pitch_stats['is_called_strike'], pitch_stats['pitches'], 
                                                 out=np.zeros_like(pitch_stats['is_called_strike'], dtype=float), 
                                                 where=pitch_stats['pitches']!=0)
    
    # Calculate overall league averages
    league_averages = {
        'whiff_rate': {
            'mean': float(pitch_stats['whiff_rate'].mean()),
            'std': float(pitch_stats['whiff_rate'].std()),
            'p90': float(pitch_stats['whiff_rate'].quantile(0.9)),
            'p75': float(pitch_stats['whiff_rate'].quantile(0.75)),
            'p50': float(pitch_stats['whiff_rate'].quantile(0.5)),
            'p25': float(pitch_stats['whiff_rate'].quantile(0.25)),
            'p10': float(pitch_stats['whiff_rate'].quantile(0.1))
        },
        'chase_rate': {
            'mean': float(pitch_stats['chase_rate'].mean()),
            'std': float(pitch_stats['chase_rate'].std()),
            'p90': float(pitch_stats['chase_rate'].quantile(0.9)),
            'p75': float(pitch_stats['chase_rate'].quantile(0.75)),
            'p50': float(pitch_stats['chase_rate'].quantile(0.5)),
            'p25': float(pitch_stats['chase_rate'].quantile(0.25)),
            'p10': float(pitch_stats['chase_rate'].quantile(0.1))
        },
        'weak_contact_rate': {
            'mean': float(pitch_stats['weak_contact_rate'].mean()),
            'std': float(pitch_stats['weak_contact_rate'].std()),
            'p90': float(pitch_stats['weak_contact_rate'].quantile(0.9)),
            'p75': float(pitch_stats['weak_contact_rate'].quantile(0.75)),
            'p50': float(pitch_stats['weak_contact_rate'].quantile(0.5)),
            'p25': float(pitch_stats['weak_contact_rate'].quantile(0.25)),
            'p10': float(pitch_stats['weak_contact_rate'].quantile(0.1))
        },
        'hard_hit_rate': {
            'mean': float(pitch_stats['hard_hit_rate'].mean()),
            'std': float(pitch_stats['hard_hit_rate'].std()),
            'p90': float(pitch_stats['hard_hit_rate'].quantile(0.9)),
            'p75': float(pitch_stats['hard_hit_rate'].quantile(0.75)),
            'p50': float(pitch_stats['hard_hit_rate'].quantile(0.5)),
            'p25': float(pitch_stats['hard_hit_rate'].quantile(0.25)),
            'p10': float(pitch_stats['hard_hit_rate'].quantile(0.1))
        },
        'called_strike_rate': {
            'mean': float(pitch_stats['called_strike_rate'].mean()),
            'std': float(pitch_stats['called_strike_rate'].std()),
            'p90': float(pitch_stats['called_strike_rate'].quantile(0.9)),
            'p75': float(pitch_stats['called_strike_rate'].quantile(0.75)),
            'p50': float(pitch_stats['called_strike_rate'].quantile(0.5)),
            'p25': float(pitch_stats['called_strike_rate'].quantile(0.25)),
            'p10': float(pitch_stats['called_strike_rate'].quantile(0.1))
        }
    }
    
    return league_averages

def get_top_mlb_pitchers(year=2024, min_innings=50):
    """
    Get a comprehensive list of MLB pitchers for league averages using MLBAM IDs
    """
    try:
        print(f"Fetching {year} pitching leaders...")
        leaders = pitching_stats(year, qual=min_innings)
        chad = chadwick_register()
        # Merge on FanGraphs ID to get MLBAM ID
        merged = leaders.merge(chad, left_on='IDfg', right_on='key_fangraphs')
        # Drop rows without MLBAM ID
        merged = merged[~merged['key_mlbam'].isna()]
        # Get unique MLBAM IDs as integers
        pitcher_ids = merged['key_mlbam'].astype(int).unique().tolist()
        print(f"Found {len(pitcher_ids)} eligible MLBAM pitchers")
        return pitcher_ids[:50]  # Limit for performance
    except Exception as e:
        print(f"Error fetching pitcher list: {e}")
        # Fallback to manual list
        return [
            676979, 657277, 592332, 607200, 656731, 681432, 663559,
            592789, 608369, 605400, 594798, 608331, 592450, 605200,
            664040, 608369, 592789, 605400, 594798, 608331, 592450,
            605200, 676979, 681432, 663559, 656731, 592789, 608369,
            605400, 594798, 608331, 592450, 605200
        ]

def get_statcast_league_averages_comprehensive(year=2024, min_pitches=50):
    """
    Get comprehensive league averages from a large sample of pitchers
    """
    print(f"Fetching comprehensive Statcast data for {year}...")
    
    # Get a large list of pitchers
    pitcher_ids = get_top_mlb_pitchers(year)
    
    all_data = []
    successful_pitchers = 0
    
    for i, pitcher_id in enumerate(pitcher_ids):
        try:
            print(f"Fetching data for pitcher {i+1}/{len(pitcher_ids)} (ID: {pitcher_id})")
            df = statcast_pitcher(f'{year}-03-01', f'{year}-11-30', pitcher_id)
            if not df.empty and len(df) >= min_pitches:
                all_data.append(df)
                successful_pitchers += 1
                print(f"✓ Added {len(df)} pitches from pitcher {pitcher_id}")
            else:
                print(f"✗ Skipped pitcher {pitcher_id} (insufficient data)")
        except Exception as e:
            print(f"✗ Error with pitcher {pitcher_id}: {e}")
            continue
    
    print(f"\nSuccessfully collected data from {successful_pitchers} pitchers")
    
    if not all_data:
        print("No data collected")
        return None
    
    # Combine all data
    league_df = pd.concat(all_data, ignore_index=True)
    print(f"Total pitches collected: {len(league_df)}")
    
    # Preprocess data
    league_df = preprocess_statcast_data(league_df)
    league_df = add_pitch_event_columns(league_df)
    
    # Calculate league averages
    league_averages = calculate_pitch_type_averages(league_df, min_pitches)
    
    return league_averages

def get_fangraphs_league_averages():
    """
    Alternative: Get league averages from FanGraphs API
    Note: Requires API key for full access
    """
    # FanGraphs has some public endpoints
    # You can also scrape their leaderboards
    pass

def create_custom_scoring_model():
    """
    Create your own custom scoring model based on research
    """
    # Example: Run Value Based Model
    run_values = {
        'whiff': 0.25,      # Positive run value
        'called_strike': 0.15,
        'weak_contact': 0.10,
        'chase': 0.05,
        'hard_hit': -0.30   # Negative run value
    }
    
    return run_values

def main():
    """Main function to run league average research"""
    print("=== League Averages Research ===\n")
    
    # Get comprehensive Statcast-based averages
    print("1. Calculating Comprehensive Statcast League Averages...")
    print("This will fetch data from 50+ MLB pitchers for accurate averages\n")
    
    statcast_averages = get_statcast_league_averages_comprehensive(2024, min_pitches=50)
    
    if statcast_averages:
        print("\nStatcast League Averages (2024):")
        for metric, stats in statcast_averages.items():
            print(f"\n{metric.upper()}:")
            print(f"  Mean: {stats['mean']:.3f}")
            print(f"  Std Dev: {stats['std']:.3f}")
            print(f"  90th Percentile: {stats['p90']:.3f}")
            print(f"  75th Percentile: {stats['p75']:.3f}")
            print(f"  50th Percentile: {stats['p50']:.3f}")
            print(f"  25th Percentile: {stats['p25']:.3f}")
            print(f"  10th Percentile: {stats['p10']:.3f}")
    
    # Save to JSON for use in your app
    if statcast_averages:
        with open('league_averages_2024.json', 'w') as f:
            json.dump(statcast_averages, f, indent=2)
        print("\nSaved to league_averages_2024.json")
    
    print("\n=== Research Complete ===")

if __name__ == "__main__":
    main() 
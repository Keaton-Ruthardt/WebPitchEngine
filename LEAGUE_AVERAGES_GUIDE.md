# Professional League Averages Guide
## How to Find and Implement Accurate Baseball Metrics

### 🎯 **Method 1: Statcast Data (Most Accurate)**

#### **Step 1: Run the Research Script**
```bash
cd backend
python league_averages_research.py
```

This will:
- Fetch data from multiple MLB pitchers
- Calculate actual league averages
- Save results to `league_averages_2024.json`

#### **Step 2: Use the Results in Your App**
```python
# Load the calculated averages
with open('league_averages_2024.json', 'r') as f:
    LEAGUE_BENCHMARKS = json.load(f)
```

### 📊 **Method 2: Public Research Sources**

#### **Baseball Savant (Statcast)**
- **URL**: https://baseballsavant.mlb.com/statcast_search
- **What to look for**: 
  - Whiff rate by pitch type
  - Chase rate by pitch type
  - Hard hit rate by pitch type
- **How to use**: Export data and calculate averages

#### **FanGraphs**
- **URL**: https://www.fangraphs.com/leaders.aspx
- **Metrics available**:
  - SwStr% (Swinging Strike Rate)
  - O-Swing% (Chase Rate)
  - Hard% (Hard Hit Rate)
- **Limitation**: Less granular than Statcast

#### **Baseball Reference**
- **URL**: https://www.baseball-reference.com
- **Good for**: Historical context and traditional stats

### 🔬 **Method 3: Academic Research**

#### **Key Papers to Reference:**
1. **"The Physics of Baseball"** - Alan Nathan
   - Launch angle and exit velocity research
   - Hard hit thresholds

2. **"Run Value of Pitch Types"** - Tom Tango
   - Expected run values for different outcomes
   - wOBA impact calculations

3. **"Statcast and the Future of Baseball Analytics"** - Various authors
   - Modern metrics and their interpretation

#### **Research Institutions:**
- **MIT Sloan Sports Analytics Conference**
- **SABR (Society for American Baseball Research)**
- **Baseball Prospectus Annual**

### 🛠️ **Method 4: Create Your Own Model**

#### **Option A: Run Value Model**
```python
def calculate_run_value_score(pitch_data):
    """Calculate score based on expected run value"""
    run_values = {
        'whiff': 0.25,      # +0.25 runs (strikeout)
        'called_strike': 0.15,  # +0.15 runs (strike)
        'weak_contact': 0.10,   # +0.10 runs (weak out)
        'chase': 0.05,      # +0.05 runs (swing on ball)
        'hard_hit': -0.30   # -0.30 runs (extra base hit)
    }
    
    total_value = 0
    for outcome, value in run_values.items():
        total_value += pitch_data[outcome] * value
    
    return total_value
```

#### **Option B: wOBA-Based Model**
```python
def calculate_woba_score(pitch_data):
    """Calculate score based on wOBA impact"""
    woba_weights = {
        'whiff': 0.0,       # Strikeout = 0 wOBA
        'weak_contact': 0.3, # Weak contact = low wOBA
        'hard_hit': 0.9     # Hard hit = high wOBA
    }
    
    expected_woba = 0
    for outcome, weight in woba_weights.items():
        expected_woba += pitch_data[outcome] * weight
    
    return 1 - expected_woba  # Lower wOBA = better for pitcher
```

### 📈 **Method 5: Machine Learning Approach**

#### **Step 1: Collect Training Data**
```python
# Gather data from multiple seasons
training_data = []
for year in [2022, 2023, 2024]:
    data = get_statcast_data(year)
    training_data.append(data)

# Combine and preprocess
ml_dataset = pd.concat(training_data)
```

#### **Step 2: Train a Model**
```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# Features: pitch characteristics
X = ml_dataset[['release_speed', 'spin_rate', 'zone', 'count']]

# Target: run value or wOBA
y = ml_dataset['woba_value']

# Train model
model = RandomForestRegressor()
model.fit(X_train, y_train)
```

#### **Step 3: Use for Scoring**
```python
def ml_score(pitch_features):
    """Get ML-based performance prediction"""
    prediction = model.predict([pitch_features])
    return 10 - (prediction * 10)  # Convert to 0-10 scale
```

### 🎯 **Recommended Implementation Strategy**

#### **Phase 1: Quick Start (Week 1)**
1. Run the research script
2. Use the generated averages
3. Test with Garrett Crochet data

#### **Phase 2: Validation (Week 2)**
1. Compare your results to known elite pitchers
2. Adjust benchmarks if needed
3. Validate against public research

#### **Phase 3: Customization (Week 3)**
1. Implement run value model
2. Add confidence intervals
3. Create pitch-type specific benchmarks

### 📋 **Sample League Averages (2024)**

Based on Statcast data, here are approximate league averages:

```python
LEAGUE_BENCHMARKS_2024 = {
    'whiff_rate': {
        'mean': 0.22,    # 22% average whiff rate
        'std': 0.08,     # 8% standard deviation
        'elite': 0.32,   # Top 10% threshold
        'good': 0.28     # Top 25% threshold
    },
    'chase_rate': {
        'mean': 0.26,    # 26% average chase rate
        'std': 0.07,     # 7% standard deviation
        'elite': 0.34,   # Top 10% threshold
        'good': 0.30     # Top 25% threshold
    },
    'hard_hit_rate': {
        'mean': 0.35,    # 35% average hard hit rate
        'std': 0.08,     # 8% standard deviation
        'elite': 0.25,   # Bottom 10% (lower is better)
        'good': 0.30     # Bottom 25% (lower is better)
    }
}
```

### 🔍 **Validation Checklist**

#### **Before Implementation:**
- [ ] Compare to known elite pitchers (Verlander, deGrom, etc.)
- [ ] Validate against public research
- [ ] Test with multiple seasons of data
- [ ] Check for sample size bias

#### **After Implementation:**
- [ ] Garrett Crochet shows green nodes for elite pitches
- [ ] Scores correlate with known performance levels
- [ ] MiLB pitchers score appropriately lower
- [ ] Scores are consistent across different analyses

### 🚀 **Next Steps**

1. **Run the research script** to get your own averages
2. **Test with Garrett Crochet** to validate elite recognition
3. **Compare to public sources** for validation
4. **Implement the best approach** for your needs

This approach will give you scientifically sound, professional-grade league averages that will properly recognize elite performance like Garrett Crochet's. 
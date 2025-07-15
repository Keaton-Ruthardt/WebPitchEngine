# Push Performance Insights Engine

A comprehensive baseball analytics platform that provides data-driven pitch recommendations and performance insights for both MLB and MiLB pitchers.

## Features

### Enhanced Tree Visualization
- **Interactive Hover Tooltips**: Hover over count nodes to see detailed metrics
- **Raw Data Display**: Click on nodes to view comprehensive data tables
- **Real-time Metrics**: Display whiff rates, hard hit rates, chase rates, and more
- **Color-coded Performance**: Green (good), Yellow (average), Red (poor) based on scores

### Data Integration
- **MLB Data**: Real-time Statcast data via pybaseball
- **MiLB Support**: CSV upload functionality for minor league data
- **Individualized Reports**: Player-specific analysis and recommendations
- **Count-specific Analysis**: Detailed breakdown by ball-strike counts

### Advanced Analytics
- **Count Tree Analysis**: Visual representation of pitch recommendations by count
- **Hot Zone Analysis**: Batter-specific zone analysis for specific matchups
- **Performance Metrics**: Comprehensive statistical analysis
- **Real-time Processing**: Live data fetching and analysis

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/bun
- Python 3.8+ and pip
- Git

### Backend Setup (Flask API)

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Install pybaseball** (for MLB data):
   ```bash
   pip install pybaseball
   ```

6. **Start the Flask server**:
   ```bash
   python app.py
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup (React + TypeScript)

1. **Navigate to project root**:
   ```bash
   cd ..
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   bun dev
   ```

The frontend will run on `http://localhost:5173`

## Usage

### MLB Analysis
1. Select "MLB" as the league
2. Choose year(s) for analysis (max 2 years)
3. Select a pitcher from the dropdown
4. Choose opponent type (specific batter or average handedness)
5. Select metrics to display in hover tooltips
6. Click "Generate Pitch Report"

### MiLB Analysis
1. Select "MiLB" as the league
2. Choose year(s) for analysis
3. Select a pitcher from the dropdown
4. Upload CSV data for the selected pitcher
5. Configure analysis parameters
6. Generate the report

### CSV Format for MiLB Data
Required columns:
- `pitch_type`: Type of pitch thrown (e.g., "4-Seam Fastball", "Slider")
- `description`: Outcome of the pitch (e.g., "swinging_strike", "hit_into_play")
- `balls`: Number of balls in count (0-3)
- `strikes`: Number of strikes in count (0-2)
- `events`: Final outcome of at-bat (e.g., "single", "strikeout")

## API Endpoints

### GET `/api/pitchers/{league}`
Get available pitchers for a given league (MLB/MiLB)

### POST `/api/analyze`
Generate pitch recommendation analysis
```json
{
  "pitcher_id": 676979,
  "years": ["2023"],
  "opponent_type": "specific",
  "batter_name": "Aaron Judge",
  "min_pitches": 10
}
```

### POST `/api/upload-milb`
Upload MiLB CSV data for a pitcher

### GET `/api/health`
Health check endpoint

## Architecture

### Frontend (React + TypeScript)
- **Components**: Modular UI components with shadcn/ui
- **State Management**: React hooks for local state
- **API Integration**: Service layer for backend communication
- **Visualization**: Interactive count tree with Plotly.js

### Backend (Flask + Python)
- **Data Processing**: pandas and numpy for statistical analysis
- **MLB Integration**: pybaseball for Statcast data
- **File Handling**: CSV upload and validation
- **Authentication**: Flask-Login for user management

## Data Flow

1. **User Input**: League, pitcher, years, opponent type
2. **Data Fetching**: 
   - MLB: pybaseball Statcast API
   - MiLB: Uploaded CSV files
3. **Processing**: Statistical analysis and count-specific calculations
4. **Visualization**: Interactive tree with hover tooltips and raw data tables
5. **Output**: Comprehensive pitch recommendations by count

## Performance Metrics

The engine calculates and displays:
- **Whiff Rate**: Percentage of swinging strikes
- **Hard Hit Rate**: Percentage of balls hit 95+ mph
- **Called Strike Rate**: Percentage of called strikes
- **Weak Contact Rate**: Percentage of balls hit <85 mph
- **Chase Rate**: Percentage of swings on pitches outside the zone

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## Roadmap

- [ ] Pitch sequencing analysis
- [ ] Advanced statistical models
- [ ] Real-time game analysis
- [ ] Mobile app support
- [ ] Team-level analytics
- [ ] Historical trend analysis

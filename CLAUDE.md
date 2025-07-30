# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Push Performance Insights Engine is a baseball analytics platform that provides data-driven pitch recommendations and performance insights for MLB and MiLB pitchers. The application uses real-time Statcast data and advanced statistical analysis to generate count-specific pitch recommendations.

## Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript, built with Vite
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React hooks and TanStack Query for API state
- **Routing**: React Router for client-side navigation
- **Charts**: Recharts for data visualization

### Backend (Flask + Python)
- **Framework**: Flask with Flask-CORS for API endpoints
- **Data Processing**: pandas and numpy for statistical calculations
- **MLB Data**: pybaseball for Statcast data integration
- **Authentication**: Flask-Login with basic user management
- **File Handling**: CSV upload for MiLB data with secure filename handling

## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install
# or
bun install

# Start development server (runs on localhost:5173)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend Development
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server (runs on localhost:5000)
python app.py
```

### Quick Start Scripts
- `start.bat` (Windows) and `start.sh` (Unix) are provided for rapid development setup

## Key Components and Services

### Frontend Structure
- `src/components/analytics/`: Core analytics components including CountTreeVisualization, FilterPanel, and MiLBUpload
- `src/components/ui/`: shadcn/ui component library
- `src/pages/`: Main application pages (Analytics, Index, Login, NotFound)
- `src/services/api.ts`: Centralized API communication layer
- `src/hooks/`: Custom React hooks for mobile detection and toast notifications

### Backend Structure
- `app.py`: Main Flask application with API endpoints and authentication
- `requirements.txt`: Python dependencies including Flask, pandas, pybaseball
- `uploads/`: Directory for MiLB CSV file storage
- Sample data files and league averages data for analysis

## API Endpoints

### Core Analytics
- `GET /api/pitchers/{league}`: Retrieve available pitchers for MLB/MiLB
- `POST /api/analyze`: Generate pitch recommendation analysis
- `POST /api/upload-milb`: Upload MiLB CSV data
- `GET /api/health`: Health check endpoint

### Authentication
- Basic Flask-Login implementation with hardcoded users for demo purposes

## Data Flow and Analysis

The application processes baseball data through several stages:
1. **Data Input**: MLB data via pybaseball Statcast API or MiLB data via CSV upload
2. **Statistical Analysis**: Count-specific calculations using pandas/numpy
3. **Pitch Effectiveness Rating (PER)**: 0-100 scale scoring system
4. **Visualization**: Interactive count tree with hover tooltips and raw data tables

## Key Metrics Calculated
- Whiff Rate, Hard Hit Rate, Called Strike Rate
- Weak Contact Rate, Chase Rate
- Expected Run Value (xRV) components
- Pitch Effectiveness Rating (PER) with color-coded recommendations

## Environment and Deployment

### Local Development
- Frontend runs on Vite dev server (port 5173)
- Backend runs on Flask dev server (port 5000)
- CORS configured for cross-origin requests

### Production Deployment
- Configured for Render deployment with `render.yaml`
- Procfile for backend process management
- Environment variables for Flask secret key and configuration

## File Upload Requirements

### MiLB CSV Format
Required columns for MiLB data uploads:
- `pitch_type`: Type of pitch (e.g., "4-Seam Fastball", "Slider")
- `description`: Pitch outcome (e.g., "swinging_strike", "hit_into_play")
- `balls`: Ball count (0-3)
- `strikes`: Strike count (0-2)
- `events`: At-bat outcome (e.g., "single", "strikeout")

## Development Guidelines

### Frontend
- Use TypeScript for all new components
- Follow shadcn/ui patterns for consistent styling
- Utilize TanStack Query for API state management
- Implement proper error handling and loading states

### Backend
- Use pandas for data processing and statistical calculations
- Implement proper error handling for API endpoints
- Validate file uploads and data formats
- Cache expensive calculations where appropriate

### Testing and Quality
- Run `npm run lint` before committing frontend changes
- Ensure pybaseball dependency is available for MLB data functionality
- Test CSV upload functionality with sample data files
- Verify API endpoints return proper error responses

## Common Development Tasks

### Adding New Analytics Features
1. Create new components in `src/components/analytics/`
2. Add corresponding API endpoints in `backend/app.py`
3. Update the API service layer in `src/services/api.ts`
4. Implement proper error handling and loading states

### Modifying Pitch Analysis Logic
- Core analysis functions are in `backend/app.py`
- Statistical calculations use pandas DataFrame operations
- PER scoring system can be adjusted in the analysis functions

### Adding New UI Components
- Use shadcn/ui CLI to add new components
- Follow existing patterns in `src/components/ui/`
- Implement proper TypeScript interfaces for props
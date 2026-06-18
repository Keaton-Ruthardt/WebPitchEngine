# Push Performance Insights Engine

A full-stack baseball analytics platform that turns raw pitch-by-pitch data into **count-specific, data-driven pitch recommendations** for MLB and MiLB pitchers. Built for Push Performance.

**🔗 Live app:** https://webpitchengine-frontend.onrender.com
**Demo login:** `coach` / `push_performance` (or `admin` / `password123`)

> Note: the backend is hosted on a free Render tier and may take ~30–60s to wake on the first request.

---

## What it does

Every pitch outcome is scored, aggregated by ball–strike count, and rolled up into a single **Pitch Effectiveness Rating (PER)** so a coach can see, at a glance, which pitch to throw in each count against a given hitter or handedness. Results render as an interactive count tree with hover metrics and drill-down raw data.

- **MLB:** pulls live Statcast data via `pybaseball` for any pitcher/season.
- **MiLB:** upload a pitcher's CSV and get the same analysis where Statcast isn't available.
- **Matchup-aware:** analyze vs. a specific batter or vs. league-average handedness.
- **Count tree visualization:** PER and supporting metrics for all 12 ball–strike counts.

## How it works — the PER model

The engine grades each pitch type, in each count, on a **0–100 scale** derived from the metrics that actually move expected run value (xRV):

1. **Per-metric scoring** — whiff rate, hard-hit rate, called-strike rate, weak-contact rate, and chase rate are each scored by percentile against league benchmarks (`league_averages_2024.json`).
2. **xRV-weighted combination** — metrics are combined using weights reflecting each one's impact on run value (hard-hit rate carries the most weight, chase rate the least).
3. **Count-specific adjustment** — weights shift by count: ahead-in-count situations prioritize whiffs/called strikes, behind-in-count prioritize avoiding hard contact and walks.
4. **Final PER (0–100)** with a color-coded recommendation band (Elite → Avoid).

Full methodology and weight rationale: [`SCORING_SYSTEM_GUIDE.md`](./SCORING_SYSTEM_GUIDE.md). League-average derivation: [`LEAGUE_AVERAGES_GUIDE.md`](./LEAGUE_AVERAGES_GUIDE.md).

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React + TypeScript, Vite, shadcn/ui, Plotly.js |
| Backend | Flask (Python), pandas, numpy |
| Data | Statcast via `pybaseball` (MLB), CSV upload (MiLB) |
| Auth | Flask session auth |
| Deploy | Render (static frontend + Python web service) |

## API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET`  | `/api/pitchers/{league}` | List available pitchers (MLB/MiLB) |
| `POST` | `/api/analyze` | Generate count-tree pitch analysis |
| `POST` | `/api/upload-milb` | Upload a MiLB pitcher CSV |
| `GET`  | `/api/health` | Health check |

**`/api/analyze` request:**
```json
{
  "pitcher_id": 676979,
  "years": ["2023"],
  "opponent_type": "specific",
  "batter_name": "Aaron Judge",
  "min_pitches": 10
}
```

## MiLB CSV format

Required columns: `pitch_type`, `description`, `balls`, `strikes`, `events`.
A reference file is included: [`backend/sample_milb_data.csv`](./backend/sample_milb_data.csv).

## Roadmap

- Pitch **sequencing** analysis (current model is count-state, not sequence-aware)
- Expanded statistical models and confidence intervals on PER
- Real-time in-game analysis and team-level rollups

---

*Built by Keaton Ruthardt.*

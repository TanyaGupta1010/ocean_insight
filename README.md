# OCEAN INSIGHT — Real-Time Ocean Intelligence & Environmental Monitoring

> A presentation-grade marine environmental intelligence platform developed for Bennett University, delivering real-time telemetry observation, thermodynamic analysis, and ecological health monitoring.

---

## 🌊 Architecture Overview

```
ocean-platform/
├── backend/                  # FastAPI Python backend service
│   ├── database.py           # SQLite / SQLAlchemy persistence configuration
│   ├── main.py               # REST API endpoints & telemetry routing
│   ├── models.py             # ORM database models
│   └── requirements.txt      # Python dependencies for Render deployment
├── dashboard/                # Modern React 19 + Vite frontend
│   ├── src/
│   │   ├── App.jsx           # Integrated environmental instrument UI
│   │   ├── App.css           # Light ocean design system & animations
│   │   └── main.jsx          # Root React entrypoint
│   ├── index.html            # Google Fonts (Outfit, Plus Jakarta Sans, JetBrains Mono)
│   ├── vercel.json           # Vercel SPA rewrite configuration
│   └── package.json          # Node dependencies & Vite build scripts
├── simulator/                # Autonomous Buoy Telemetry Simulator
│   └── gps_simulator.py      # GPS, thermodynamic & battery discharge simulation
├── requirements.txt          # Root Python requirements
└── README.md
```

---

## 🚀 Deployment Guide

### 1. Backend Deployment (Render)
- **Service Type**: Web Service
- **Root Directory**: `backend` (or repository root)
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `PORT`: `10000` (auto-provided by Render)
  - `CORS_ORIGINS`: `*` (or your specific Vercel frontend URL)

### 2. Frontend Deployment (Vercel)
- **Framework Preset**: `Vite`
- **Root Directory**: `dashboard`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Your deployed Render backend URL (e.g., `https://ocean-insight-api.onrender.com`)

---

## 💻 Local Development

### 1. Start the Backend:
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend:
```bash
cd dashboard
npm install
npm run dev
```

### 3. Run the Telemetry Simulator:
```bash
python simulator/gps_simulator.py
```

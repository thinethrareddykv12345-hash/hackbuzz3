# TeamPulse AI

A production-ready AI-powered MERN stack collaboration intelligence platform for college group projects.

## Project Structure
- `client/`: React + Vite + Tailwind CSS
- `server/`: Node.js + Express + MongoDB
- `ai-service/`: Python FastAPI + Gemini AI

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API Key

### 2. Backend Setup
```bash
cd server
npm install
# Update .env with your MongoDB URL and API keys
npm run dev
```

### 3. AI Service Setup
```bash
cd ai-service
# Create a virtual environment (recommended)
python -m venv venv
# On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Update .env with your Gemini API Key
python main.py
```

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Core Features
- **AI Contribution Engine**: Analyzes quality, effort, and technical difficulty.
- **Supportive Feedback**: AI provides non-surveillance, encouraging insights.
- **Real-time Updates**: Socket.io integration for live team activity.
- **Analytics**: Heatmaps, contribution balance, and team health scores.
- **Gamification**: Streaks, badges, and milestones.

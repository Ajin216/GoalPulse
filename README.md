# Pulse - World Cup Live Scoring Dashboard

A full-stack live World Cup scoring dashboard.

## Structure
- `/backend`: Node.js, Express, ws server
- `/frontend`: React, Vite, Tailwind CSS, Zustand

## Running Locally (Mock Mode)
This project includes a Mock Mode that requires zero API keys. It simulates a live matchday by ticking match clocks and randomly generating goals, cards, and substitutions.

### 1. Start the Backend
```bash
cd backend
npm install
npm start
```
The backend WebSocket server will run on `ws://localhost:8080/live`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will connect to the backend WebSocket and display real-time updates. If the backend is not running, the frontend will automatically fall back to an in-browser mock WebSocket server after 3 seconds.

## Using a Real Provider
To connect to a real sports API:
1. In `backend/`, copy `.env.example` to `.env`.
2. Set `MOCK_MODE=false`.
3. Set `SPORTS_API_KEY` and `SPORTS_API_URL` to your provider's details.
4. Update `normalizeFixtures` in `backend/sportsApiClient.js` to match the exact schema returned by your API provider.

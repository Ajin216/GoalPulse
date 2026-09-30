require('dotenv').config();
const express = require('express');
const http = require('http');
const { setupWsServer } = require('./wsServer');
const { startPolling } = require('./poller');
const cache = require('./cache');
const { fetchStandings, fetchTopScorers } = require('./sportsApiClient');

const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const server = http.createServer(app);

// Setup WebSocket Server
const { broadcastUpdate } = setupWsServer(server);

// Start Poller
startPolling((type, payload) => {
  broadcastUpdate(type, payload);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Snapshot endpoint (debug only)
app.get('/snapshot', (req, res) => {
  res.json({ matches: cache.get(), timestamp: new Date().toISOString() });
});

// Standings endpoint
app.get('/api/competitions/:id/standings', async (req, res) => {
  const id = req.params.id;
  try {
    let data = cache.getCompetitionData(id).standings;
    const lastFetched = cache.getCompetitionData(id).lastFetched;
    
    // Cache valid for 15 minutes
    if (!data || (Date.now() - lastFetched > 15 * 60 * 1000)) {
      data = await fetchStandings(id);
      cache.setCompetitionData(id, 'standings', data);
    }
    res.json(data);
  } catch (error) {
    console.error(`Error fetching standings for ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

// Matches endpoint
app.get('/api/competitions/:id/matches', async (req, res) => {
  const id = req.params.id;
  try {
    process.env.COMPETITION_ID = id; // Update poller to track this league
    const { fetchLiveScores } = require('./sportsApiClient');
    const data = await fetchLiveScores(id);
    cache.setMatches(data);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching matches for ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Scorers endpoint
app.get('/api/competitions/:id/scorers', async (req, res) => {
  const id = req.params.id;
  try {
    let data = cache.getCompetitionData(id).scorers;
    const lastFetched = cache.getCompetitionData(id).lastFetched;
    
    if (!data || (Date.now() - lastFetched > 15 * 60 * 1000)) {
      data = await fetchTopScorers(id);
      cache.setCompetitionData(id, 'scorers', data);
    }
    res.json(data);
  } catch (error) {
    console.error(`Error fetching scorers for ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch scorers' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const currentCache = cache.get();
    const liveMatches = (currentCache.matches || []).filter(m => m.status === 'LIVE').map(m => `${m.homeTeam.shortName} vs ${m.awayTeam.shortName} (${m.score.fullTime.home}-${m.score.fullTime.away})`).join(', ');
    
    const systemInstruction = `You are the official AI Football Assistant for GoalPulse, a live football score and stats website. Answer questions about football history, rules, players, leagues, and teams concisely and enthusiastically. Keep answers under 3-4 sentences unless asked for detail. If asked about non-football topics, politely steer the conversation back to football. Current live matches context: ${liveMatches || 'No live matches right now.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Error generating chat response:', error);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

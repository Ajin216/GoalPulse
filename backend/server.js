require('dotenv').config();
const express = require('express');
const http = require('http');
const { setupWsServer } = require('./wsServer');
const { startPolling } = require('./poller');
const cache = require('./cache');
const { fetchStandings, fetchTopScorers } = require('./sportsApiClient');

const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));

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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

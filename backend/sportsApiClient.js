// Using native fetch (Node.js 18+)

// 8s timeout with AbortController
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function normalizeFixtures(matches) {
  if (!Array.isArray(matches)) return [];
  return matches.map(match => ({
    id: match.id,
    competition: match.competition?.name || 'Unknown Competition',
    stage: match.stage || 'Regular Season',
    matchday: match.matchday || 1,
    status: ['IN_PLAY', 'PAUSED'].includes(match.status) ? 'LIVE' : (match.status === 'FINISHED' ? 'FINISHED' : 'SCHEDULED'),
    minute: 0, // football-data.org free tier doesn't always provide live minutes
    utcDate: match.utcDate,
    venue: match.venue || 'Unknown Venue',
    home: {
      id: match.homeTeam?.id,
      name: match.homeTeam?.shortName || match.homeTeam?.name,
      code: match.homeTeam?.tla,
      crest: match.homeTeam?.crest,
      score: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? 0
    },
    away: {
      id: match.awayTeam?.id,
      name: match.awayTeam?.shortName || match.awayTeam?.name,
      code: match.awayTeam?.tla,
      crest: match.awayTeam?.crest,
      score: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? 0
    },
    events: []
  }));
}

async function fetchLiveScores(providedCompId) {
  const API_KEY = process.env.SPORTS_API_KEY;
  const compId = providedCompId || process.env.COMPETITION_ID || 2021;
  const API_URL = `https://api.football-data.org/v4/competitions/${compId}/matches`;

  if (!API_KEY) {
    throw new Error('SPORTS_API_KEY missing');
  }

  const response = await fetchWithTimeout(API_URL, {
    headers: { 'X-Auth-Token': API_KEY }
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return normalizeFixtures(data.matches || []);
}

async function fetchStandings(competitionId) {
  const API_KEY = process.env.SPORTS_API_KEY;
  if (!API_KEY) throw new Error('SPORTS_API_KEY missing');

  const response = await fetchWithTimeout(`https://api.football-data.org/v4/competitions/${competitionId}/standings`, {
    headers: { 'X-Auth-Token': API_KEY }
  });
  if (!response.ok) throw new Error(`API returned ${response.status} ${response.statusText}`);
  const data = await response.json();
  return data.standings || [];
}

async function fetchTopScorers(competitionId) {
  const API_KEY = process.env.SPORTS_API_KEY;
  if (!API_KEY) throw new Error('SPORTS_API_KEY missing');

  const response = await fetchWithTimeout(`https://api.football-data.org/v4/competitions/${competitionId}/scorers`, {
    headers: { 'X-Auth-Token': API_KEY }
  });
  if (!response.ok) throw new Error(`API returned ${response.status} ${response.statusText}`);
  const data = await response.json();
  return data.scorers || [];
}

module.exports = { fetchLiveScores, fetchStandings, fetchTopScorers };

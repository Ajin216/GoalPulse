let cache = { matches: [], competitions: {} };

module.exports = {
  get: () => cache,
  setMatches: (matches) => { cache.matches = matches; },

  getCompetitionData: (id) => {
    return cache.competitions[id] || { standings: null, scorers: null, lastFetched: 0 };
  },

  setCompetitionData: (id, type, data) => {
    if (!cache.competitions[id]) {
      cache.competitions[id] = { standings: null, scorers: null, lastFetched: 0 };
    }
    cache.competitions[id][type] = data;
    cache.competitions[id].lastFetched = Date.now();
  }
};

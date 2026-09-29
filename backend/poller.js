const { fetchLiveScores } = require('./sportsApiClient');
const cache = require('./cache');
const { getDiff } = require('./diff');

let intervalIdMatches = null;

function startPolling(onUpdate) {
  const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS, 10) || 15000;
  console.log(`[Poller] Starting... (Matches Interval: ${POLL_INTERVAL_MS}ms)`);

  const pollMatches = async () => {
    try {
      const freshData = await fetchLiveScores();

      const oldData = cache.get().matches;
      const changedMatches = getDiff(oldData, freshData);

      cache.setMatches(freshData);

      if (changedMatches.length > 0) {
        console.log(`[Poller] Detected changes in ${changedMatches.length} matches. Broadcasting...`);
        onUpdate('MATCHES_UPDATE', changedMatches);
      }
    } catch (error) {
      console.error('[Poller] Error during matches polling:', error.message);
    }
  };

  // Run the first poll immediately
  pollMatches();

  // Set the loop
  intervalIdMatches = setInterval(pollMatches, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (intervalIdMatches) {
    clearInterval(intervalIdMatches);
    intervalIdMatches = null;
  }
  console.log('[Poller] Polling stopped.');
}

module.exports = { startPolling, stopPolling };
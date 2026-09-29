function getMatchSignature(match) {
  const eventIds = match.events ? match.events.map(e => e.id).join(',') : '';
  return `${match.status}-${match.minute}-${match.home.score}-${match.away.score}-${eventIds}`;
}

function getDiff(oldMatches, newMatches) {
  const oldMap = new Map(oldMatches.map(m => [m.id, getMatchSignature(m)]));
  
  const changedMatches = [];
  for (const match of newMatches) {
    const oldSig = oldMap.get(match.id);
    const newSig = getMatchSignature(match);
    
    // If it's a new match not in cache, or signature changed
    if (oldSig !== newSig) {
      changedMatches.push(match);
    }
  }
  return changedMatches;
}

module.exports = { getDiff, getMatchSignature };

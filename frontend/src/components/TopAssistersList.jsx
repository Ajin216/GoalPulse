import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchScorersData } from '../store/matchSlice';
import { motion } from 'framer-motion';

function getAvatarColor(code) {
  if (!code) return 'var(--color-subtle)';
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 50%, 25%)`;
}

function SmallTeamCrest({ crestUrl, teamName }) {
  const [error, setError] = useState(false);
  const code = teamName ? teamName.substring(0, 3).toUpperCase() : '---';

  if (!crestUrl || error) {
    return (
      <div
        className="w-[18px] h-[18px] shrink-0 rounded-full flex items-center justify-center text-[7px] font-bold text-primary border border-subtle"
        style={{ backgroundColor: getAvatarColor(code) }}
      >
        {code}
      </div>
    );
  }

  return (
    <img
      src={crestUrl}
      alt={teamName}
      className="w-[18px] h-[18px] object-contain shrink-0"
      onError={() => setError(true)}
    />
  );
}

export default function TopAssistersList({ condensed = false }) {
  const dispatch = useDispatch();
  const scorers = useSelector(state => state.match.scorers);
  const loading = useSelector(state => state.match.scorersLoading);
  const selectedCompetition = useSelector(state => state.match.selectedCompetition);

  useEffect(() => {
    if (selectedCompetition) {
      dispatch(fetchScorersData(selectedCompetition));
    }
  }, [selectedCompetition, dispatch]);

  if (loading || !scorers || scorers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-live"></div>
      </div>
    );
  }

  // Filter out players with no assists, sort by assists, then pick top N
  const sortedAssisters = [...scorers]
    .filter(s => s.assists != null)
    .sort((a, b) => b.assists - a.assists);

  const list = condensed ? sortedAssisters.slice(0, 5) : sortedAssisters;

  if (list.length === 0) {
    return (
      <div className="text-center text-muted py-8 text-sm">
        No assist data available.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-3">
        {list.map((scorer, index) => {
          const rank = index + 1;
          const isFirst = rank === 1;

          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={scorer.player.id || index}
              className={`relative rounded-xl border p-4 flex items-center justify-between overflow-hidden transition-colors ${isFirst
                  ? 'bg-surface border-blue-500/30 hover:bg-surface-alt'
                  : 'bg-surface border-subtle hover:bg-surface-alt'
                }`}
            >
              {isFirst && (
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
              )}

              <div className="absolute -left-2 -bottom-4 text-8xl font-black text-white/[0.03] pointer-events-none select-none z-0">
                {rank}
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-6 text-center font-bold text-muted text-lg">{rank}</div>
                <div>
                  <div className="text-base font-bold text-primary truncate max-w-[150px] sm:max-w-[200px]">
                    {scorer.player.name}
                  </div>
                  <div className="text-sm text-secondary flex items-center gap-2 mt-0.5 truncate max-w-[150px] sm:max-w-[200px]">
                    <SmallTeamCrest crestUrl={scorer.team.crest} teamName={scorer.team.name} />
                    {scorer.team.name}
                  </div>
                </div>
              </div>

              <div className="text-right relative z-10 shrink-0">
                <div className="text-2xl font-bold text-blue-400 tabular-nums leading-none">{scorer.assists}</div>
                <div className="text-[10px] text-muted uppercase tracking-widest font-semibold mt-1">Assists</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

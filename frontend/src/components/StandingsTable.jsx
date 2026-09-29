import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStandingsData } from '../store/matchSlice';
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

function TeamCrest({ crestUrl, teamName }) {
  const [error, setError] = useState(false);
  const code = teamName ? teamName.substring(0, 3).toUpperCase() : '---';

  if (!crestUrl || error) {
    return (
      <div
        className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold text-primary border border-subtle"
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
      className="w-6 h-6 object-contain shrink-0"
      onError={() => setError(true)}
    />
  );
}

export default function StandingsTable({ condensed = false }) {
  const dispatch = useDispatch();
  const standings = useSelector(state => state.match.standings);
  const loading = useSelector(state => state.match.standingsLoading);
  const selectedCompetition = useSelector(state => state.match.selectedCompetition);

  useEffect(() => {
    if (selectedCompetition) {
      dispatch(fetchStandingsData(selectedCompetition));
    }
  }, [selectedCompetition, dispatch]);

  if (loading || !standings || standings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-live"></div>
      </div>
    );
  }

  const totalStandings = standings.find(s => s.type === 'TOTAL') || standings[0];
  if (!totalStandings || !totalStandings.table) {
    return <div className="text-center text-muted py-8">No standings data available.</div>;
  }

  const rows = condensed ? totalStandings.table.slice(0, 8) : totalStandings.table;

  return (
    <div className="w-full">
      <div className="bg-surface rounded-xl border border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-base border-b border-subtle text-secondary text-xs uppercase tracking-wider">
                <th className="p-3 font-semibold text-center w-12">Pos</th>
                <th className="p-3 font-semibold">Club</th>
                <th className="p-3 font-semibold text-center px-1">MP</th>
                <th className="p-3 font-semibold text-center px-1">W</th>
                <th className="p-3 font-semibold text-center px-1">D</th>
                <th className="p-3 font-semibold text-center px-1">L</th>
                <th className="p-3 font-semibold text-center px-2">GD</th>
                <th className="p-3 font-bold text-center">Pts</th>
              </tr>
            </thead>
            <motion.tbody layout className="divide-y divide-subtle text-sm">
              {rows.map((row) => {
                let borderClass = 'border-l-4 border-l-transparent';
                if (row.position === 1) borderClass = 'border-l-4 border-l-gold';
                else if (row.position <= 4) borderClass = 'border-l-4 border-l-live';

                let gdColor = 'text-secondary';
                let gdText = row.goalDifference;
                if (row.goalDifference > 0) {
                  gdColor = 'text-primary';
                  gdText = `+${row.goalDifference}`;
                } else if (row.goalDifference < 0) {
                  gdColor = 'text-loss';
                }

                return (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={row.team.id}
                    className={`hover:bg-surface-alt transition-colors bg-surface ${borderClass}`}
                  >
                    <td className="p-3 text-center font-bold text-primary">{row.position}</td>
                    <td className="p-3 font-medium flex items-center gap-3">
                      <TeamCrest crestUrl={row.team.crest} teamName={row.team.name} />
                      <span className="truncate text-primary">{row.team.name}</span>
                    </td>
                    <td className="p-3 text-center text-secondary tabular-nums px-1">{row.playedGames}</td>
                    <td className="p-3 text-center text-secondary tabular-nums px-1">{row.won}</td>
                    <td className="p-3 text-center text-secondary tabular-nums px-1">{row.draw}</td>
                    <td className="p-3 text-center text-secondary tabular-nums px-1">{row.lost}</td>
                    <td className={`p-3 text-center tabular-nums px-2 font-medium ${gdColor}`}>{gdText}</td>
                    <td className="p-3 text-center font-bold text-gold tabular-nums text-[15px]">{row.points}</td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

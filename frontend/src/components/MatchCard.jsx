import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
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

function AnimatedScore({ score, isLive }) {
  const [flash, setFlash] = useState(false);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score > prevScore.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(timer);
    }
    prevScore.current = score;
  }, [score]);

  return (
    <motion.span
      animate={flash ? { scale: [1, 1.15, 1], color: ['#fff', 'var(--color-live)', isLive ? 'var(--color-live)' : 'var(--color-primary)'] } : { scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`font-mono font-bold text-lg tabular-nums ${isLive ? 'text-live' : 'text-primary'}`}
    >
      {score}
    </motion.span>
  );
}

function formatMatchDate(utcString, formatType) {
  if (!utcString) return '';
  const date = new Date(utcString);
  if (formatType === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (formatType === 'date') {
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  return '';
}

export default function MatchCard({ id, onClick, compact = false }) {
  const match = useSelector(state => state.match.matches[id]);

  if (!match) return null;

  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const isScheduled = match.status === 'SCHEDULED';

  const timeStr = formatMatchDate(match.utcDate, 'time');
  const dateStr = formatMatchDate(match.utcDate, 'date');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick && onClick(id)}
      className={`relative rounded-xl p-3 cursor-pointer transition-colors border flex items-center ${
        isLive
          ? 'bg-surface border-live/30 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:bg-surface-alt'
          : 'bg-surface border-subtle hover:bg-surface-alt'
      }`}
      style={{ opacity: isFinished && !compact ? 0.85 : 1 }}
    >
      {/* Left side: Teams */}
      <div className="flex-1 flex flex-col gap-2 border-r border-subtle/50 pr-3">
        {[match.home, match.away].map((team, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div
              className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold text-primary/90 border border-subtle overflow-hidden bg-surface"
              style={{ backgroundColor: !team.crest ? getAvatarColor(team.code) : 'transparent' }}
            >
              {team.crest ? <img src={team.crest} alt={team.code} className="w-full h-full object-cover" /> : team.code}
            </div>
            <span className={`font-sans font-medium text-[14px] truncate ${isFinished ? 'text-secondary' : 'text-primary'}`}>
              {team.name}
            </span>
          </div>
        ))}
      </div>

      {/* Middle: Scores */}
      <div className="w-12 flex flex-col gap-2 items-center justify-center border-r border-subtle/50 px-2 shrink-0">
        {[match.home, match.away].map((team, idx) => (
          <div key={idx} className="flex items-center justify-center h-6">
            {isScheduled ? (
              <span className="font-mono text-muted text-lg">-</span>
            ) : (
              <AnimatedScore score={team.score} isLive={isLive} />
            )}
          </div>
        ))}
      </div>

      {/* Right side: Status indicator */}
      <div className="w-24 flex flex-col items-end justify-center pl-3 shrink-0 text-right">
        {isLive ? (
          <>
            <div className="text-[11px] font-mono font-bold text-live flex items-center gap-1.5 mb-1">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-live"
              />
              LIVE {match.minute}'
            </div>
          </>
        ) : isFinished ? (
          <>
            <div className="text-[13px] font-bold text-secondary">FT</div>
            <div className="text-[11px] text-muted whitespace-nowrap mt-0.5">{dateStr}</div>
          </>
        ) : (
          <>
            <div className="text-[13px] font-bold text-primary">{timeStr}</div>
            <div className="text-[11px] text-muted whitespace-nowrap mt-0.5">{dateStr}</div>
          </>
        )}
      </div>

      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-live/50 to-transparent" />
      )}
    </motion.div>
  );
}

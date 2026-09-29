import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedMatchId } from '../store/matchSlice';
import { X, Clock, AlertTriangle, UserMinus, MonitorPlay } from 'lucide-react';

const EventIcon = ({ type }) => {
  switch (type) {
    case 'GOAL': return <div className="w-4 h-4 rounded-full bg-pulse-green shadow-[0_0_8px_rgba(57,255,143,0.6)]" />;
    case 'YELLOW_CARD': return <div className="w-3.5 h-4.5 rounded-sm bg-pulse-amber shadow-[0_0_8px_rgba(255,178,56,0.6)]" />;
    case 'RED_CARD': return <div className="w-3.5 h-4.5 rounded-sm bg-pulse-red shadow-[0_0_8px_rgba(255,77,94,0.6)]" />;
    case 'SUBSTITUTION': return <UserMinus className="w-4 h-4 text-white/70" />;
    case 'VAR_CHECK': return <MonitorPlay className="w-4 h-4 text-blue-400" />;
    default: return <AlertTriangle className="w-4 h-4 text-white/50" />;
  }
};

export default function MatchDetailPanel() {
  const matchId = useSelector(state => state.match.selectedMatchId);
  const match = useSelector(state => matchId ? state.match.matches[matchId] : null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') dispatch(setSelectedMatchId(null));
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [dispatch]);

  if (!match) return null;

  const events = [...match.events].sort((a, b) => b.minute - a.minute);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => dispatch(setSelectedMatchId(null))}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-pulse-panel border-l border-white/10 z-50 shadow-2xl flex flex-col transform transition-transform duration-300">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{match.competition}</div>
            <div className="font-display font-bold text-xl">{match.home.code} vs {match.away.code}</div>
          </div>
          <button
            onClick={() => dispatch(setSelectedMatchId(null))}
            className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pulse-green"
          >
            <X className="w-6 h-6 text-white/70" />
          </button>
        </div>

        {/* Scoreboard */}
        <div className="p-6 border-b border-white/10 bg-black/20">
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <div className="text-4xl font-display font-bold text-white">{match.home.score}</div>
              <div className="text-sm font-sans font-medium text-white/70 mt-2">{match.home.name}</div>
            </div>
            <div className="px-4">
              <div className="text-xs text-white/40 uppercase tracking-widest mb-1">
                {match.status}
              </div>
              {match.status === 'LIVE' && (
                <div className="text-pulse-green font-mono font-bold animate-pulse text-lg">
                  {match.minute}'
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-4xl font-display font-bold text-white">{match.away.score}</div>
              <div className="text-sm font-sans font-medium text-white/70 mt-2">{match.away.name}</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-display font-semibold mb-6 text-white/80 flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-pulse-green" /> Match Events
          </h3>

          {events.length === 0 ? (
            <div className="text-center text-white/40 py-8 text-sm">
              No events recorded yet.
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => {
                return (
                  <div key={event.id} className="flex gap-4 items-start animate-fade-in relative">
                    <div className="w-8 pt-0.5 text-xs font-mono font-medium text-white/50 text-right">
                      {event.minute}'
                    </div>
                    <div className="mt-1 relative z-10">
                      <EventIcon type={event.type} />
                    </div>
                    <div className="flex-1 pb-6 border-l border-white/10 -ml-[25px] pl-[33px] last:border-0 last:pb-0">
                      <div className="text-sm font-medium text-white/90">
                        {event.type.replace('_', ' ')} <span className="text-white/40 mx-1">•</span> {event.team}
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {event.player}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedMatchId } from '../store/matchSlice';
import { getMockMatchDetails } from '../mocks/matchDetailsMock';
import { X } from 'lucide-react';

const EventIcon = ({ type }) => {
  switch (type) {
    case 'goal': return <span>⚽</span>;
    case 'yellow_card': return <span>🟨</span>;
    case 'red_card': return <span>🟥</span>;
    case 'substitution': return <span>🔄</span>;
    default: return <span>📍</span>;
  }
};

export default function MatchModal() {
  const matchId = useSelector(state => state.match.selectedMatchId);
  const match = useSelector(state => matchId ? state.match.matches[matchId] : null);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Timeline');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') dispatch(setSelectedMatchId(null));
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [dispatch]);

  if (!match) return null;

  // Use the mock data function
  const mockDetails = getMockMatchDetails(match.id, match.home.name, match.away.name);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => dispatch(setSelectedMatchId(null))}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-2xl bg-pulse-panel border border-white/10 z-50 shadow-2xl rounded-t-2xl md:rounded-2xl max-h-[90vh] flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20 md:rounded-t-2xl relative">
          <div className="flex-1 text-center flex items-center justify-center space-x-4 md:space-x-8">
            <div className="text-right flex-1">
              <div className="font-display font-bold text-base md:text-xl text-white truncate max-w-[120px] md:max-w-[200px] inline-block">{match.home.name}</div>
            </div>
            <div className="text-2xl md:text-3xl font-display font-bold text-pulse-green whitespace-nowrap">
              {match.home.score} - {match.away.score}
            </div>
            <div className="text-left flex-1">
              <div className="font-display font-bold text-base md:text-xl text-white truncate max-w-[120px] md:max-w-[200px] inline-block">{match.away.name}</div>
            </div>
          </div>
          <button
            onClick={() => dispatch(setSelectedMatchId(null))}
            className="absolute right-3 top-3 p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Navigation Toggle */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('Timeline')}
            className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${activeTab === 'Timeline' ? 'text-pulse-green border-b-2 border-pulse-green bg-white/5' : 'text-white/50 hover:text-white/80'}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('Lineups')}
            className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${activeTab === 'Lineups' ? 'text-pulse-green border-b-2 border-pulse-green bg-white/5' : 'text-white/50 hover:text-white/80'}`}
          >
            Lineups
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-pulse-panel md:rounded-b-2xl">
          {activeTab === 'Timeline' && (
            <div className="relative py-4">
              {/* Vertical line centered */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10 transform -translate-x-1/2"></div>
              
              <div className="space-y-6">
                {mockDetails.events.sort((a, b) => a.minute - b.minute).map(event => {
                  const isHome = event.team === match.home.name;
                  return (
                    <div key={event.id} className="relative flex items-center justify-between w-full">
                      {/* Left Side (Home) */}
                      <div className={`w-1/2 pr-6 md:pr-10 text-right ${isHome ? 'opacity-100' : 'opacity-0'}`}>
                        {isHome && (
                          <div className="bg-white/5 p-2 md:p-3 rounded-lg border border-white/10 inline-block shadow-sm">
                            <span className="font-bold text-white text-xs md:text-sm mr-2">{event.player}</span>
                            <EventIcon type={event.type} />
                          </div>
                        )}
                      </div>

                      {/* Center Minute Marker */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-pulse-panel border border-white/20 text-pulse-green font-mono font-bold text-sm shadow-md z-10">
                        {event.minute}'
                      </div>

                      {/* Right Side (Away) */}
                      <div className={`w-1/2 pl-6 md:pl-10 text-left ${!isHome ? 'opacity-100' : 'opacity-0'}`}>
                        {!isHome && (
                          <div className="bg-white/5 p-2 md:p-3 rounded-lg border border-white/10 inline-block shadow-sm">
                            <EventIcon type={event.type} />
                            <span className="font-bold text-white text-xs md:text-sm ml-2">{event.player}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Lineups' && (
            <div>
              {/* Graphical Pitch */}
              <div className="relative w-full max-w-[300px] md:max-w-sm mx-auto aspect-[2/3] bg-green-700 border-2 md:border-4 border-white/80 rounded mb-8 overflow-hidden shadow-xl">
                {/* Center line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60 transform -translate-y-1/2"></div>
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 w-16 md:w-24 h-16 md:h-24 border-2 border-white/60 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                {/* Penalty Areas */}
                <div className="absolute top-0 left-1/2 w-32 md:w-48 h-16 md:h-24 border-2 border-t-0 border-white/60 transform -translate-x-1/2"></div>
                <div className="absolute bottom-0 left-1/2 w-32 md:w-48 h-16 md:h-24 border-2 border-b-0 border-white/60 transform -translate-x-1/2"></div>
                {/* Goal Areas */}
                <div className="absolute top-0 left-1/2 w-16 md:w-24 h-6 md:h-10 border-2 border-t-0 border-white/60 transform -translate-x-1/2"></div>
                <div className="absolute bottom-0 left-1/2 w-16 md:w-24 h-6 md:h-10 border-2 border-b-0 border-white/60 transform -translate-x-1/2"></div>

                {/* Away Team (Top Half, Attacking Down) */}
                {mockDetails.lineups.away.startingXI.map(player => (
                  <div 
                    key={player.id} 
                    className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ top: player.position.top, left: player.position.left }}
                  >
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-pulse-red border border-white text-white flex items-center justify-center text-[9px] md:text-[10px] font-bold shadow-md">
                      {player.number}
                    </div>
                    <div className="text-[8px] md:text-[9px] font-bold text-white bg-black/60 px-1 mt-0.5 rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-[40px] md:max-w-[50px] text-center shadow">
                      {player.name}
                    </div>
                  </div>
                ))}

                {/* Home Team (Bottom Half, Attacking Up) */}
                {mockDetails.lineups.home.startingXI.map(player => (
                  <div 
                    key={player.id} 
                    className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ bottom: player.position.bottom, left: player.position.left }}
                  >
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-pulse-green border border-white text-black flex items-center justify-center text-[9px] md:text-[10px] font-bold shadow-md">
                      {player.number}
                    </div>
                    <div className="text-[8px] md:text-[9px] font-bold text-white bg-black/60 px-1 mt-0.5 rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-[40px] md:max-w-[50px] text-center shadow">
                      {player.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Substitutes */}
              <div className="grid grid-cols-2 gap-4 md:gap-8 text-xs md:text-sm">
                <div>
                  <h4 className="font-display font-bold text-pulse-green mb-2 md:mb-3 border-b border-white/10 pb-1 truncate">{match.home.name} Subs</h4>
                  <ul className="space-y-1 md:space-y-2 text-white/80">
                    {mockDetails.lineups.home.substitutes.map(sub => (
                      <li key={sub.id} className="flex justify-between bg-white/5 px-2 py-1.5 rounded">
                        <span className="truncate pr-2">{sub.name}</span>
                        <span className="font-mono text-white/50">{sub.number}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-display font-bold text-pulse-red mb-2 md:mb-3 border-b border-white/10 pb-1 truncate">{match.away.name} Subs</h4>
                  <ul className="space-y-1 md:space-y-2 text-white/80">
                    {mockDetails.lineups.away.substitutes.map(sub => (
                      <li key={sub.id} className="flex justify-between bg-white/5 px-2 py-1.5 rounded">
                        <span className="truncate pr-2">{sub.name}</span>
                        <span className="font-mono text-white/50">{sub.number}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

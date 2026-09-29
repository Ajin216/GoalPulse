import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCompetition } from '../store/matchSlice';

const COMPETITIONS = [
  { id: '2021', name: 'Premier League' },
  { id: '2001', name: 'Champions League' },
  { id: '2014', name: 'La Liga' },
  { id: '2019', name: 'Serie A' },
  { id: '2002', name: 'Bundesliga' },
  { id: '2015', name: 'Ligue 1' }
];

export default function Header() {
  const dispatch = useDispatch();
  const status = useSelector(state => state.match.connectionStatus);
  const selectedCompetition = useSelector(state => state.match.selectedCompetition);

  return (
    <header className="bg-pulse-panel border-b border-white/5 sticky top-0 z-50 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <h1 className="font-display font-bold text-xl tracking-tight uppercase">GoalPulse</h1>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-6 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50 hidden sm:inline-block">League:</span>
            <select 
              value={selectedCompetition}
              onChange={(e) => dispatch(setSelectedCompetition(e.target.value))}
              className="bg-white/10 text-white text-sm rounded-md px-3 py-1.5 border border-white/20 focus:outline-none focus:border-pulse-green"
            >
              {COMPETITIONS.map(comp => (
                <option key={comp.id} value={comp.id} className="text-black">
                  {comp.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="relative flex h-3 w-3">
              {status === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-green opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                status === 'connected' ? 'bg-pulse-green' : 
                status === 'connecting' ? 'bg-pulse-amber' : 'bg-pulse-red'
              }`}></span>
            </span>
            <span className="text-white/70 uppercase tracking-wider text-xs">
              {status}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

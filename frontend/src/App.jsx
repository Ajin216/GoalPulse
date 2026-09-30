import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLiveScores } from './hooks/useLiveScores';
import Header from './components/Header';
import MatchGrid from './components/MatchGrid';
import MatchModal from './components/MatchModal';
import StandingsTable from './components/StandingsTable';
import TopScorersList from './components/TopScorersList';
import TopAssistersList from './components/TopAssistersList';
import MatchCard from './components/MatchCard';
import ChatBot from './components/ChatBot';
import { setSelectedMatchId } from './store/matchSlice';

function App() {
  const [activeTab, setActiveTab] = useState('Matches');
  useLiveScores();

  const dispatch = useDispatch();
  const matchIds = useSelector(state => state.match.displayOrder);
  const matches = useSelector(state => state.match.matches);

  const liveMatchIds = matchIds.filter(id => {
    const match = matches[id];
    return match && match.status === 'LIVE';
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-base text-primary">
      <Header />

      {/* Live Strip */}
      {liveMatchIds.length > 0 && (
        <div className="bg-surface border-b border-subtle">
          <div className="max-w-[1440px] mx-auto w-full px-4 py-4 flex gap-4 overflow-x-auto no-scrollbar">
            {liveMatchIds.map(id => (
              <div key={id} className="w-[280px] shrink-0">
                <MatchCard id={id} compact={true} onClick={(id) => dispatch(setSelectedMatchId(id))} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto w-full px-4 pt-6 md:pt-8 flex-1 flex flex-col md:flex-row gap-8">

        {/* Mobile Tab Switcher (< 768px) */}
        <div className="md:hidden flex gap-4 border-b border-subtle overflow-x-auto pb-2">
          {['Matches', 'Scorers', 'Assists'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === tab
                  ? 'text-live border-b-2 border-live'
                  : 'text-secondary hover:text-primary'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content Column */}
        <main className={`flex-1 ${activeTab !== 'Matches' ? 'hidden md:block' : 'block'}`}>
          <MatchGrid />
          
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold font-display uppercase tracking-wider text-primary border-b border-subtle pb-2">
              Standings
            </h2>
            <div className="w-full">
              <StandingsTable condensed={false} />
            </div>
          </div>
        </main>

        {/* Right Sidebar (>= 768px becomes stacked, >= 1024px becomes side column) */}
        <aside className={`w-full lg:w-[400px] shrink-0 space-y-8 ${activeTab === 'Matches' ? 'hidden md:block' : 'block'}`}>

          <div className={`space-y-4 ${activeTab === 'Assists' ? 'hidden md:block' : 'block'}`}>
            <h2 className="text-xl font-bold font-display uppercase tracking-wider text-primary border-b border-subtle pb-2">
              Top Scorers
            </h2>
            <div className="sticky top-[4.5rem]">
              <TopScorersList condensed={true} />
            </div>
          </div>

          <div className={`space-y-4 ${activeTab === 'Scorers' ? 'hidden md:block' : 'block'}`}>
            <h2 className="text-xl font-bold font-display uppercase tracking-wider text-primary border-b border-subtle pb-2">
              Top Assisters
            </h2>
            <TopAssistersList condensed={true} />
          </div>

        </aside>
      </div>

      <MatchModal />
      <ChatBot />
    </div>
  );
}

export default App;

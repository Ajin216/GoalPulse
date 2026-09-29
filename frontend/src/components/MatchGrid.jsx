import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedMatchId, fetchMatchesData } from '../store/matchSlice';
import MatchCard from './MatchCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function MatchGrid() {
  const dispatch = useDispatch();
  const matchIds = useSelector(state => state.match.displayOrder);
  const matches = useSelector(state => state.match.matches);
  const selectedCompetition = useSelector(state => state.match.selectedCompetition);
  const loading = useSelector(state => state.match.matchesLoading);

  // Fetch matches and reset matchday when the selected competition changes
  useEffect(() => {
    if (selectedCompetition) {
      dispatch(fetchMatchesData(selectedCompetition));
      setCurrentMatchday(null);
    }
  }, [selectedCompetition, dispatch]);

  // Derive matchdays
  const matchesArray = matchIds.map(id => matches[id]).filter(Boolean);
  
  // Find all distinct matchdays and sort them
  const matchdays = useMemo(() => {
    const days = new Set(matchesArray.map(m => m.matchday).filter(Boolean));
    return Array.from(days).sort((a, b) => a - b);
  }, [matchesArray]);
  
  const [currentMatchday, setCurrentMatchday] = useState(null);

  // Auto-detect the most relevant matchday
  useEffect(() => {
    if (matchdays.length > 0 && currentMatchday === null) {
      // Find the first matchday that has live or scheduled matches
      // If none, default to the last completed matchday (which would be the max matchday)
      let detectedDay = null;
      
      // Sort matches to find the active matchday
      for (const day of matchdays) {
        const dayMatches = matchesArray.filter(m => m.matchday === day);
        const hasLive = dayMatches.some(m => m.status === 'LIVE');
        const hasScheduled = dayMatches.some(m => m.status === 'SCHEDULED');
        
        if (hasLive || hasScheduled) {
          detectedDay = day;
          break;
        }
      }
      
      if (detectedDay === null) {
        detectedDay = matchdays[matchdays.length - 1]; // Latest finished matchday
      }
      
      setCurrentMatchday(detectedDay);
    }
  }, [matchdays, matchesArray, currentMatchday]);

  const handlePrevDay = () => {
    const currentIndex = matchdays.indexOf(currentMatchday);
    if (currentIndex > 0) {
      setCurrentMatchday(matchdays[currentIndex - 1]);
    }
  };

  const handleNextDay = () => {
    const currentIndex = matchdays.indexOf(currentMatchday);
    if (currentIndex < matchdays.length - 1) {
      setCurrentMatchday(matchdays[currentIndex + 1]);
    }
  };

  const currentDayMatches = matchesArray.filter(m => m.matchday === currentMatchday);
  const totalMatchdays = matchdays.length > 0 ? matchdays[matchdays.length - 1] : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <div className="w-full pb-12">
      {/* Top Header Bar for Matchday Controls */}
      <div className="flex items-center justify-between mb-4 bg-base/80 backdrop-blur-md z-30 py-3 border-b border-subtle sticky top-0">
        <button
          onClick={handlePrevDay}
          disabled={matchdays.indexOf(currentMatchday) === 0 || matchdays.length === 0}
          className="p-2 text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-sm font-bold text-primary tracking-wide">
          Matchday {currentMatchday || '-'} <span className="text-muted font-normal">of {totalMatchdays || '-'}</span>
        </h2>

        <button
          onClick={handleNextDay}
          disabled={matchdays.indexOf(currentMatchday) === matchdays.length - 1 || matchdays.length === 0}
          className="p-2 text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-live"></div>
        </div>
      ) : currentDayMatches.length === 0 ? (
        <div className="text-center text-muted py-12">
          No matches found for this matchday.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMatchday}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {currentDayMatches.map(match => (
              <MatchCard key={match.id} id={match.id} onClick={(id) => dispatch(setSelectedMatchId(id))} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

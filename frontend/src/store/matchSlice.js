import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  matches: {}, // key: match.id, value: match
  displayOrder: [], // array of match.ids
  connectionStatus: 'disconnected', // 'connecting' | 'connected' | 'disconnected'
  recentlyUpdatedIds: {}, // { [matchId]: 'score' | 'other' }
  selectedMatchId: null,
  selectedCompetition: '2021', // Default to Premier League
  standings: [],
  scorers: [],
  standingsLoading: false,
  scorersLoading: false,
  matchesLoading: false,
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    setSelectedMatchId: (state, action) => {
      state.selectedMatchId = action.payload;
    },
    setSelectedCompetition: (state, action) => {
      state.selectedCompetition = action.payload;
      state.standings = [];
      state.scorers = [];
    },
    handleSnapshot: (state, action) => {
      const { matches } = action.payload;
      const matchesMap = {};
      const displayOrder = [];
      matches.forEach(m => {
        matchesMap[m.id] = m;
        displayOrder.push(m.id);
      });
      state.matches = matchesMap;
      state.displayOrder = displayOrder;
      // We don't overwrite standings/scorers from snapshot anymore
    },
    updateMatches: (state, action) => {
      const changedMatches = action.payload;
      changedMatches.forEach(match => {
        const oldMatch = state.matches[match.id];
        let updateType = 'other';

        if (oldMatch && (oldMatch.home.score !== match.home.score || oldMatch.away.score !== match.away.score)) {
          updateType = 'score';
        }

        state.matches[match.id] = match;
        state.recentlyUpdatedIds[match.id] = updateType;
      });
    },
    clearRecentlyUpdated: (state, action) => {
      const changedMatches = action.payload;
      changedMatches.forEach(m => {
        if (state.recentlyUpdatedIds[m.id]) {
          delete state.recentlyUpdatedIds[m.id];
        }
      });
    },
    updateStandings: (state, action) => {
      state.standings = action.payload;
    },
    updateScorers: (state, action) => {
      state.scorers = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStandingsData.pending, (state) => {
        state.standingsLoading = true;
      })
      .addCase(fetchStandingsData.fulfilled, (state, action) => {
        state.standingsLoading = false;
        state.standings = action.payload;
      })
      .addCase(fetchStandingsData.rejected, (state) => {
        state.standingsLoading = false;
      })
      .addCase(fetchScorersData.pending, (state) => {
        state.scorersLoading = true;
      })
      .addCase(fetchScorersData.fulfilled, (state, action) => {
        state.scorersLoading = false;
        state.scorers = action.payload;
      })
      .addCase(fetchScorersData.rejected, (state) => {
        state.scorersLoading = false;
      })
      .addCase(fetchMatchesData.pending, (state) => {
        state.matchesLoading = true;
      })
      .addCase(fetchMatchesData.fulfilled, (state, action) => {
        state.matchesLoading = false;
        const matches = action.payload;
        const matchesMap = {};
        const displayOrder = [];
        matches.forEach(m => {
          matchesMap[m.id] = m;
          displayOrder.push(m.id);
        });
        state.matches = matchesMap;
        state.displayOrder = displayOrder;
      })
      .addCase(fetchMatchesData.rejected, (state) => {
        state.matchesLoading = false;
      });
  }
});

export const {
  setConnectionStatus,
  setSelectedMatchId,
  setSelectedCompetition,
  handleSnapshot,
  updateMatches,
  clearRecentlyUpdated,
  updateStandings,
  updateScorers
} = matchSlice.actions;

export const handleUpdate = (changedMatches) => (dispatch) => {
  dispatch(updateMatches(changedMatches));

  // Clear flash animations after 1.5s
  setTimeout(() => {
    dispatch(clearRecentlyUpdated(changedMatches));
  }, 1500);
};

export const fetchStandingsData = createAsyncThunk(
  'match/fetchStandings',
  async (competitionId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/competitions/${competitionId}/standings`);
      if (!response.ok) throw new Error('Failed to fetch standings');
      return await response.json();
    } catch (e) {
      console.error('Failed to fetch standings, returning empty array:', e);
      return [];
    }
  }
);

export const fetchMatchesData = createAsyncThunk(
  'match/fetchMatches',
  async (competitionId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/competitions/${competitionId}/matches`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return await response.json();
    } catch (e) {
      console.log('Falling back to empty matches array on error');
      return [];
    }
  }
);

export const fetchScorersData = createAsyncThunk(
  'match/fetchScorers',
  async (competitionId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/competitions/${competitionId}/scorers`);
      if (!response.ok) throw new Error('Failed to fetch scorers');
      return await response.json();
    } catch (e) {
      console.error('Failed to fetch scorers, returning empty array:', e);
      return [];
    }
  }
);

export default matchSlice.reducer;

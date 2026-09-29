import { configureStore } from '@reduxjs/toolkit';
import matchReducer from './matchSlice';

export const store = configureStore({
  reducer: {
    match: matchReducer,
  },
});

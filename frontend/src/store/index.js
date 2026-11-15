import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import portfolioReducer from './slices/portfolioSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    portfolio: portfolioReducer,
  },
});

export default store;

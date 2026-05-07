import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import teamReducer from './slices/teamSlice';
import projectReducer from './slices/projectSlice';
import contributionReducer from './slices/contributionSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    teams: teamReducer,
    projects: projectReducer,
    contributions: contributionReducer,
    notifications: notificationReducer,
  },
});

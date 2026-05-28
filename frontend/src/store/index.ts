import { configureStore } from '@reduxjs/toolkit';
import assignmentReducer from './assignmentSlice';
import generationReducer from './generationSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assignment: assignmentReducer,
    generation: generationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

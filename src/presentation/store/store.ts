/**
 * Redux store konfigurasyonu
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import namazReducer from './namazSlice';
import seriReducer from './seriSlice';
import muhafizReducer from './muhafizSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    namaz: namazReducer,
    seri: seriReducer,
    muhafiz: muhafizReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


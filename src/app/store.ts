import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import themeReducer from '../features/theme/ThemeSlice'
import providerReducer from '../features/provider/providerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    provider: providerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

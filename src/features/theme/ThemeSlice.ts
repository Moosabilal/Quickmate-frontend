import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeState } from '../../util/interface/ITheme';

const initialState: ThemeState = {
  currentTheme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.currentTheme); 
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.currentTheme = action.payload;
      localStorage.setItem('theme', state.currentTheme); 
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
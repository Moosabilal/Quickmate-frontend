import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector'; 
import { toggleTheme } from '../features/theme/ThemeSlice'; 

const ThemeToggle = () => {
  const dispatch = useAppDispatch();

  const currentTheme = useAppSelector((state) => state.theme.currentTheme);

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]); 

  const handleToggle = () => {
    dispatch(toggleTheme()); 
  };

  return (
    <button
      onClick={handleToggle} 
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`} 
    >
      {currentTheme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
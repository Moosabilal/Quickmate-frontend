import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch'; 
import { logout } from '../../features/auth/authSlice'; 
import ThemeToggle from '../../components/ThemeToggle';
import { authService } from '../../services/authService';
import { getCloudinaryUrl } from '../../util/cloudinary';

const Header = () => {

    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth); 
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const handleLogout = async () => {
        await authService.logout()
        dispatch(logout()); 
        setIsProfileDropdownOpen(false);
    };

  return (
      <header className="flex justify-between items-center p-4 pr-16 bg-white dark:bg-gray-800 shadow-md">
          <h1 className="text-xl font-semibold">Dashboard Overview</h1>
          <div className="relative flex space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img src={getCloudinaryUrl(user?.profilePicture || '')} alt="Profile" className="w-8 h-8 rounded-full" />
              <span>{user?.name || 'Admin'}</span> 
              <svg className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-14 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600">Logout</button>
              </div>
            )}
          </div>
        </header>
  )
}

export default Header

import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle'; 
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout, updateProfile } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { Bell } from 'lucide-react';

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector(state => state.auth);
    const location = useLocation();

    const isProfilePage = location.pathname.startsWith('/profile/*');

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.relative')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    React.useEffect(() => {
        
        const fetchUser = async () => {
          try {
            const userData = await authService.getUser();
            
            dispatch(updateProfile({ user: userData }));
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          }
        };
        if (isAuthenticated) {
    
        fetchUser();
        }
      
    }, []);

    const handleLogout = async () => {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            await authService.logout()
            dispatch(logout());
            setIsDropdownOpen(false);
            navigate('/login');
        }
    };



    return (
        <header className="fixed top-0 w-full z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-slate-200 dark:border-gray-700">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">Q</span>
        </div>
        <span className="text-xl font-semibold text-slate-800 dark:text-white">QuickMaker</span>
      </div>

      <nav className="hidden md:flex space-x-8">
        <Link to="/" className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Home</Link>
        <Link to="/services" className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Services</Link>
        <Link to="/providers" className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Providers</Link>
        <Link to="/about" className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">About Us</Link>
      </nav>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {/* <Bell className="w-6 h-6 text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors" /> */}

        {isAuthenticated && !isProfilePage ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
            >
              <img src={getCloudinaryUrl(user?.profilePicture || '')} alt="User Avatar" className="w-8 h-8 rounded-full" />
              <span>{user?.name || 'My Account'}</span>
              <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : !isAuthenticated && !isProfilePage ? (
          <div className="space-x-2 hidden sm:block">
            <Link to="/login">
              <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-2 rounded-md">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                Register
              </button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  </div>
</header>

    );
};

export default Header;
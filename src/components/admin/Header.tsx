import React, { useState } from 'react'
import { createPortal } from 'react-dom'; // 1. Import createPortal
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../features/auth/authSlice';
import ThemeToggle from '../ThemeToggle';
import { authService } from '../../services/authService';
import { getCloudinaryUrl } from '../../util/cloudinary';
import DeleteConfirmationModal from '../deleteConfirmationModel';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';

interface HeaderProps {
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (isProfileDropdownOpen && !(event.target as HTMLElement).closest('.relative')) {
            setIsProfileDropdownOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    await authService.logout()
    dispatch(logout());
    setIsProfileDropdownOpen(false);
    setShowDeleteModal(false);
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20 dark:border-gray-700/20 transition-colors duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <div className="flex items-center gap-3">
               <div className="lg:hidden flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">Q</div>
                  <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">QuickMate</span>
               </div>

               <h1 className="hidden lg:block text-xl font-semibold text-gray-800 dark:text-white">
                 Dashboard Overview
               </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 focus:outline-none group"
                >
                  <img 
                    src={user?.profilePicture ? getCloudinaryUrl(user?.profilePicture) : '/profileImage.png'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-blue-500 transition-all object-cover" 
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 md:hidden">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    
                    <Link 
                      to="/admin/profile-settings" 
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    
                    <button 
                      onClick={() => setShowDeleteModal(true)} 
                      className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {createPortal(
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleLogout}
          itemType={DeleteConfirmationTypes.LOGOUT}
        />,
        document.body
      )}
    </>
  )
}

export default Header
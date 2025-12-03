import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MdOutlineSettings,
  MdHistory,
  MdOutlineAccountBalanceWallet,
  MdOutlineChat,
  MdOutlineMiscellaneousServices,
  MdLogout,
  MdMenu,
  MdClose
} from 'react-icons/md';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../features/auth/authSlice';
import { getCloudinaryUrl } from '../../util/cloudinary';
import DeleteConfirmationModal from '../deleteConfirmationModel';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { authService } from '../../services/authService';

const Sidebar = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New State for Mobile Menu
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const navItems = [
    { name: 'Profile Settings', icon: <MdOutlineSettings className="w-5 h-5" />, path: '/profile' },
    { name: 'Booking History', icon: <MdHistory className="w-5 h-5" />, path: '/profile/booking-history' },
    { name: 'Wallet', icon: <MdOutlineAccountBalanceWallet className="w-5 h-5" />, path: '/profile/wallet' },
    { name: 'Live Chat', icon: <MdOutlineChat className="w-5 h-5" />, path: '/chat' },
    // { name: 'Calendar', icon: <MdOutlineCalendarMonth className="w-5 h-5" />, path: '/profile/calendar' },
    // { name: 'Notifications', icon: <MdOutlineNotificationsNone className="w-5 h-5" />, path: '/profile/notifications' },
  ];

  const serviceProviderItem = {
    name: 'Manage Your Services',
    icon: <MdOutlineMiscellaneousServices className="w-5 h-5" />,
    path: `/provider/providerDashboard`,
  };

  const location = useLocation();

  const isActive = (path: string): boolean => {
    if (path === "/profile") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
    setShowDeleteModal(false);
    navigate('/login');
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-24 left-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600"
        aria-label="Open Menu"
      >
        <MdMenu className="w-6 h-6" />
      </button>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:w-auto lg:bg-transparent lg:dark:bg-transparent lg:z-auto lg:col-span-1
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}
      `}>
        
        <div className="bg-white dark:bg-gray-800 h-full lg:h-auto lg:rounded-2xl lg:shadow-lg p-6 lg:sticky lg:top-24 overflow-y-auto border-r lg:border-none border-gray-200 dark:border-gray-700">
          
          <div className="flex justify-between items-center lg:hidden mb-6 pb-4 border-b border-slate-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Menu</h2>
            <button 
              type='button'
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full text-slate-500 dark:text-gray-400 transition-colors"
              title="Close Menu"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={user.profilePicture ? getCloudinaryUrl(user.profilePicture) : '/profileImage.png'}
                alt={user.name || 'User'}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover mx-auto"
              />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mt-4">
              {user.name?.split(' ')[0] || 'User'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Customer</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleMobileNavClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white'
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {user?.role === 'ServiceProvider' && (
              <Link
                to={serviceProviderItem.path}
                onClick={handleMobileNavClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(serviceProviderItem.path)
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white'
                  }`}
              >
                {serviceProviderItem.icon}
                <span className="font-medium">{serviceProviderItem.name}</span>
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all duration-200 font-medium"
            >
              <MdLogout className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleLogout}
        itemType={DeleteConfirmationTypes.LOGOUT}
      />
    </>
  );
};

export default Sidebar;
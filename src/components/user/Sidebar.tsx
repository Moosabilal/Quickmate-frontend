// src/components/user/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MdOutlineSettings,
  MdHistory,
  MdOutlineAccountBalanceWallet,
  MdOutlineChat,
  MdOutlineSupportAgent,
  MdOutlineCalendarMonth,
  MdOutlineNotificationsNone,
  MdOutlineMiscellaneousServices,
  MdLogout,
} from 'react-icons/md';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../features/auth/authSlice';

interface SidebarProps {
  // No props needed as user data is from Redux
}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const navItems = [
    { name: 'Profile Settings', icon: MdOutlineSettings, path: '/Profile/settings' },
    { name: 'Booking History', icon: MdHistory, path: '/Profile/history' },
    { name: 'Wallet', icon: MdOutlineAccountBalanceWallet, path: '/Profile/wallet' },
    { name: 'Live Chat', icon: MdOutlineChat, path: '/Profile/chat' },
    { name: 'Booking Assistant', icon: MdOutlineSupportAgent, path: '/Profile/assistant' },
    { name: 'Calendar', icon: MdOutlineCalendarMonth, path: '/Profile/calendar' },
    { name: 'Notifications', icon: MdOutlineNotificationsNone, path: '/Profile/notifications' },
  ];

  const manageServicesItems = [
    { name: 'Manage Your Services', icon: MdOutlineMiscellaneousServices, path: '/Profile/manage-services' },
  ];

  // Helper to determine if a link is active, considering nested routes
  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        dispatch(logout());
    }
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    // Removed rounded-tr-2xl rounded-br-2xl for fixed full-height sidebar
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg p-6 flex flex-col h-full">
      {/* User Profile Summary */}
      <div className="flex items-center mb-8">
        <img
          src="https://cdn.pixabay.com/photo/2022/09/27/19/46/ai-generated-7483596_960_720.jpg"
          alt={user.name || 'User'}
          className="w-12 h-12 rounded-full object-cover border-2 border-blue-400 mr-3"
        />
        <span className="font-semibold text-gray-800 dark:text-gray-100">{user.name || 'User Name'}</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  ${isActive(item.path) ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium' : ''}`
                }
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                {item.name}
              </Link>
            </li>
          ))}

          {/* Separator for "Manage Your Services" */}
          {user?.role === 'Provider' && (
            <li className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {manageServicesItems.map((item) => (
                <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                    ${isActive(item.path) ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium' : ''}`
                    }
                >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    {item.name}
                </Link>
                ))}
            </li>
          )}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
        >
          <MdLogout className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
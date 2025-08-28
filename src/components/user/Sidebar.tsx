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
import { CheckCircle } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../features/auth/authSlice';
import { getCloudinaryUrl } from '../../util/cloudinary';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const navItems = [
    { name: 'Profile Settings', icon: <MdOutlineSettings className="w-5 h-5" />, path: '/profile' },
    { name: 'Booking History', icon: <MdHistory className="w-5 h-5" />, path: '/profile/booking-history' },
    // { name: 'Wallet', icon: <MdOutlineAccountBalanceWallet className="w-5 h-5" />, path: '/Profile/wallet' },
    { name: 'Live Chat', icon: <MdOutlineChat className="w-5 h-5" />, path: '/profile/chatListPage' },
    // { name: 'Booking Assistant', icon: <MdOutlineSupportAgent className="w-5 h-5" />, path: '/profile/assistant' },
    // { name: 'Calendar', icon: <MdOutlineCalendarMonth className="w-5 h-5" />, path: '/profile/calendar' },
    // { name: 'Notifications', icon: <MdOutlineNotificationsNone className="w-5 h-5" />, path: '/profile/notifications' },
  ];

  const serviceProviderItem = {
    name: 'Manage Your Services',
    icon: <MdOutlineMiscellaneousServices className="w-5 h-5" />,
    path: `/providerProfile/${user?.id}`,
  };

  const isActive = (path: string) => {
  if (path === '/profile') {
    return location.pathname === '/profile'; // exact match only
  }
  return location.pathname.startsWith(path);
};


  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      dispatch(logout());
    }
  };

  if (!user) return null;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-12">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={getCloudinaryUrl(user.profilePicture || '')}
              alt={user.name || 'User'}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
            />
            {/* <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div> */}
          </div>
          <h3 className="font-semibold text-slate-800 mt-4">
            {user.name?.split(' ')[0] || 'User'}
          </h3>
          <p className="text-sm text-slate-500">Customer</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}

          {user?.role === 'ServiceProvider' && (
            <Link
              to={serviceProviderItem.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(serviceProviderItem.path)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {serviceProviderItem.icon}
              <span className="font-medium">{serviceProviderItem.name}</span>
            </Link>
          )}
        </nav>

        <div className="pt-4 border-t mt-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all duration-200 font-medium"
          >
            <MdLogout className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

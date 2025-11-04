import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MdOutlineSettings,
  MdHistory,
  MdOutlineAccountBalanceWallet,
  MdOutlineChat,
  MdOutlineMiscellaneousServices,
  MdLogout,
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
  const dispatch = useAppDispatch();
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth);

  const navItems = [
    { name: 'Profile Settings', icon: <MdOutlineSettings className="w-5 h-5" />, path: '/profile' },
    { name: 'Booking History', icon: <MdHistory className="w-5 h-5" />, path: '/profile/booking-history' },
    { name: 'Wallet', icon: <MdOutlineAccountBalanceWallet className="w-5 h-5" />, path: '/profile/wallet' },
    { name: 'Live Chat', icon: <MdOutlineChat className="w-5 h-5" />, path: '/chat' },
    // { name: 'Booking Assistant', icon: <MdOutlineSupportAgent className="w-5 h-5" />, path: '/profile/assistant' },
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
    await authService.logout()
    dispatch(logout());
    setShowDeleteModal(false)
    navigate('/login')
  };

  if (!user) return null;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-12">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={user.profilePicture ? getCloudinaryUrl(user.profilePicture) : '/profileImage.png'}
              alt={user.name || 'User'}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
            />
          </div>
          <h3 className="font-semibold text-slate-800 mt-4">
            {user.name?.split(' ')[0] || 'User'}
          </h3>
          <p className="text-sm text-slate-500">Customer</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
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
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(serviceProviderItem.path)
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
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all duration-200 font-medium"
          >
            <MdLogout className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleLogout}
        itemType={DeleteConfirmationTypes.LOGOUT}
      />
    </div>
  );
};

export default Sidebar;

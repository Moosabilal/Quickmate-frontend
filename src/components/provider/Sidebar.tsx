import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Settings, 
  Star, 
  IndianRupee, 
  LayoutDashboard, 
  Clock, 
  MessageSquare, 
  CreditCard,
  Menu,
  X 
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { provider } = useAppSelector((state) => state.provider);
  const { user } = useAppSelector((state) => state.auth);

  const location = useLocation();

  const navigationItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: `/provider/providerDashboard` },
    { icon: <User className="w-5 h-5" />, label: 'Service Profile', path: `/provider/providerProfile/${user?.id}` },
    { icon: <Settings className="w-5 h-5" />, label: 'Services', path: `/provider/providerService` },
    { icon: <Calendar className="w-5 h-5" />, label: 'Bookings', path: `/provider/providerBookingManagement` },
    { icon: <Clock className="w-5 h-5" />, label: 'Availability', path: '/provider/availability' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Subscription', path: '/provider/subscription' },
    { icon: <Star className="w-5 h-5" />, label: 'Performance', path: `/provider/performanceDashboard` },
    { icon: <IndianRupee className="w-5 h-5" />, label: 'Earnings', path: `/provider/earningsAnalitics` },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Live Chat', path: '/chat' },
  ];

  const isActive = (path: string) => {
    if (path === "/provider") {
      return location.pathname === "/provider";
    }
    return location.pathname.startsWith(path);
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        type='button'
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600"
        aria-label="Open Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:w-auto lg:bg-transparent lg:dark:bg-transparent lg:z-auto lg:h-fit
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}
      `}>
        
        <div className="bg-white dark:bg-gray-800 h-full lg:h-auto lg:rounded-2xl lg:shadow-lg dark:lg:shadow-gray-900/20 p-6 lg:sticky lg:top-24 overflow-y-auto border-r lg:border-transparent border-gray-200 dark:border-gray-700 transition-colors duration-300">
          
          <div className="flex justify-between items-center lg:hidden mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Menu</h2>
            <button 
              type='button'
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full text-slate-500 dark:text-gray-400 transition-colors"
              title="Close Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={provider.profilePhoto ? getCloudinaryUrl(provider?.profilePhoto) : '/profileImage.png'}
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover mx-auto"
              />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mt-4">
              {provider?.fullName?.split(' ')[0]}
            </h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Service Provider</p>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item, index) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={handleMobileNavClick}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
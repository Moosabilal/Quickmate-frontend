import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, LayoutGrid, CreditCard, CalendarCheck, MessageSquareQuote, BarChart, Settings, X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();

  const navigationItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin' },
    { icon: <Users className="w-5 h-5" />, label: 'Users', path: '/admin/users' },
    { icon: <UserCog className="w-5 h-5" />, label: 'Providers', path: '/admin/providers' },
    { icon: <LayoutGrid className="w-5 h-5" />, label: 'Category Management', path: '/admin/categories' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Subscription Plans', path: '/admin/subscriptionPlan' },
    { icon: <CalendarCheck className="w-5 h-5" />, label: 'Bookings', path: '/admin/bookings' },
    { icon: <MessageSquareQuote className="w-5 h-5" />, label: 'Review Moderation', path: '/admin/reviewModerationPage' },
    { icon: <BarChart className="w-5 h-5" />, label: 'Analytics', path: '/admin/analyticsDashboard' },
    { icon: <Settings className="w-5 h-5" />, label: 'Account Settings', path: '/admin/profile-settings' },
  ];

  return (
    <>
      {/* Sidebar Container 
        - Mobile: fixed, full height, z-50
        - Desktop (lg): sticky, top-20 (below header), height limited to viewport minus header
      */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out
        lg:sticky lg:top-20 lg:translate-x-0 lg:h-[calc(100vh-5rem)] lg:shadow-none border-r border-gray-200 dark:border-gray-700
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            QuickMate
          </h2>
          {/* Close button for mobile */}
          <button 
            type='button'
            aria-label="Close Sidebar"
            onClick={onClose} 
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Container - Scrolls internally if items overflow height */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[calc(100%-88px)] custom-scrollbar">
          {navigationItems.map((item, index) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin' 
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <Link
                key={index}
                to={item.path}
                onClick={onClose} // Close sidebar on mobile when link clicked
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
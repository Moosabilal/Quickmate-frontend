import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, LayoutGrid, CreditCard, CalendarCheck, MessageSquareQuote, BarChart, Settings } from 'lucide-react';

const Sidebar = () => {
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

    // { icon: <Wallet className="w-5 h-5" />, label: 'Wallet', path: '/admin/wallet' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
          QuickMate
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const isActive =
            item.path === '/admin'
              ? location.pathname === '/admin' 
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-800'
                }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

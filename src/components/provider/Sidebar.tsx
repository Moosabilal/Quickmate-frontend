import { Calendar, User, Settings, Star, DollarSign, IndianRupee } from 'lucide-react';
import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { provider } = useAppSelector((state) => state.provider);
  const { user } = useAppSelector((state) => state.auth);

  const location = useLocation();

  const navigationItems = [
    { icon: <User className="w-5 h-5" />, label: 'Dashboard', path: `/providerDashboard` },
    { icon: <Calendar className="w-5 h-5" />, label: 'Bookings', path: `/providerBookingManagement` },
    { icon: <Settings className="w-5 h-5" />, label: 'Services', path: `/providerService` },
    // { icon: <Star className="w-5 h-5" />, label: 'Performance & Reviews', path: `/providerProfile` },
    // { icon: <IndianRupee className="w-5 h-5" />, label: 'Earnings', path: `/providerProfile` },
    { icon: <User className="w-5 h-5" />, label: 'Service Profile', path: `/providerProfile/${user?.id}` },
  ];

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={getCloudinaryUrl(provider?.profilePhoto || '')}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <h3 className="font-semibold text-slate-800 mt-4">
            {provider?.fullName?.split(' ')[0]}
          </h3>
          <p className="text-sm text-slate-500">Service Provider</p>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
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
  );
};

export default Sidebar;

import { Calendar, User, Settings, Star, IndianRupee, LayoutDashboard, Clock, MessageSquare, CreditCard } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
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

  return (
    <div className="lg:col-span-1">
      {/* Container: Added dark background and border color */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 sticky top-8 border border-transparent dark:border-gray-700 transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={getCloudinaryUrl(provider?.profilePhoto || '')}
              alt="Profile"
              // Profile Border: Matches the card background in both modes
              className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
            />
          </div>
          {/* Text: Adaptive colors */}
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
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    // Active State: Gradient looks good in both, added specific shadow
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    // Inactive State: Dark mode text and hover background
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
  );
};

export default Sidebar;
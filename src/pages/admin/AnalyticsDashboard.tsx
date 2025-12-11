import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService'; 
import { AnalyticsData } from '../../util/interface/IAdmin';
import { Loader2, AlertTriangle, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminService.getDashboardAnalytics();
        if (response.success && response.data) {
          setAnalyticsData(response.data);
        } else {
          throw new Error("Failed to fetch analytics data.");
        }
      } catch (err) {
        setError("Could not load analytics data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); 

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-700 transition-colors duration-300">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <p className="text-slate-600 dark:text-gray-300 font-medium">Loading Analytics Dashboard...</p>
        </div>
    );
  }

  if (error || !analyticsData) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-700 transition-colors duration-300">
            <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mb-4" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error || "No analytics data is available."}</p>
        </div>
    );
  }

  const { topServiceCategories, bookingTrends, weeklyPattern, topProviders, kpi } = analyticsData;

  const maxProvider = Math.max(...topProviders.map(p => p.earnings), 0) || 1;
  const maxWeekly = Math.max(...weeklyPattern.map(d => d.value), 0) || 1;
  const maxBooking = Math.max(...bookingTrends.map(t => t.value), 0) || 1;

  const topCategoryValue = topServiceCategories[0]?.value || 0;
  const topProviderValue = topProviders[0]?.earnings || 0;
  const topBookingTrend = Math.max(...bookingTrends.map(t => t.value), 0);

  return (
    // Main Container: slate-50 / dark:bg-gray-700
    <div className="w-full bg-slate-50 dark:bg-gray-700 min-h-screen p-4 sm:p-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300">
          Gain insights into platform performance with comprehensive analytical tools
        </p>
      </div>

      {/* Top Row: Categories & Booking Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        
        {/* Top Service Categories - dark:bg-gray-800 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-gray-600/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Top Service Categories</h2>
              <div className="flex items-end gap-3 mt-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{topCategoryValue}%</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">Of Top Bookings</p>
            </div>
          </div>
          <div className="space-y-4">
            {topServiceCategories.map((category, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 dark:text-gray-300 font-medium">{category.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{category.value}%</span>
                </div>
                {/* Progress Bar Track: slate-100 / dark:bg-gray-700 */}
                <div className="h-2.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${category.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Trends - dark:bg-gray-800 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-gray-600/50 hover:shadow-md transition-all duration-300">
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Booking Trends</h2>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{topBookingTrend}</p>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">Peak bookings this period</p>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-3">
            {bookingTrends.map((trend, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative h-32 sm:h-40 bg-slate-50 dark:bg-gray-700/30 rounded-t-lg">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-cyan-400 dark:from-blue-600 dark:to-cyan-500 rounded-t-lg transition-all duration-500 group-hover:opacity-80 cursor-pointer" 
                    style={{ height: `${(trend.value / maxBooking) * 100}%` }} 
                    title={`${trend.month}: ${trend.value}`} 
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 font-medium truncate w-full text-center">{trend.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Weekly Pattern & Top Providers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Weekly Booking Pattern - dark:bg-gray-800 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-gray-600/50 hover:shadow-md transition-all duration-300">
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Weekly Traffic</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">Booking volume by day</p>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-3">
            {weeklyPattern.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative h-32 sm:h-40 bg-slate-50 dark:bg-gray-700/30 rounded-t-lg">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-fuchsia-400 rounded-t-lg transition-all duration-500 group-hover:opacity-80 cursor-pointer" 
                    style={{ height: `${(day.value / maxWeekly) * 100}%` }} 
                    title={`${day.day}: ${day.value}`} 
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 font-medium">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Providers - dark:bg-gray-800 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-gray-600/50 hover:shadow-md transition-all duration-300">
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Top Providers</h2>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">₹{topProviderValue.toLocaleString()}</p>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">Highest earnings this month</p>
          </div>
          <div className="space-y-4">
            {topProviders.map((provider, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 w-24 sm:w-28 flex-shrink-0 truncate" title={provider.name}>{provider.name}</span>
                <div className="flex-1 h-8 bg-slate-100 dark:bg-gray-700 rounded-lg overflow-hidden relative group">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-end pr-3 transition-all duration-1000 ease-out group-hover:opacity-90 cursor-pointer" 
                    style={{ width: `${(provider.earnings / maxProvider) * 100}%` }} 
                  >
                    <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md">₹{provider.earnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
        {/* Total Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-600/50 flex flex-col items-start justify-center transition-colors">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Total Bookings</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.totalBookings.toLocaleString()}</p>
        </div>

        {/* Active Users */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-600/50 flex flex-col items-start justify-center transition-colors">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-3">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Active Users</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.activeUsers.toLocaleString()}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-600/50 flex flex-col items-start justify-center transition-colors">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg mb-3">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{kpi.revenue.toLocaleString()}</p>
        </div>

        {/* Avg Rating */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-600/50 flex flex-col items-start justify-center transition-colors">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-3">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Avg. Rating</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.avgRating}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
// import React from 'react';
// import { TrendingUp, TrendingDown } from 'lucide-react';

// const AnalyticsDashboard: React.FC = () => {
//   const serviceCategories = [
//     { name: 'Cleaning', value: 25 },
//     { name: 'Handyman', value: 20 },
//     { name: 'Plumbing', value: 18 },
//     { name: 'Electrical', value: 15 },
//     { name: 'Gardening', value: 12 }
//   ];

//   const providers = [
//     { name: 'Provider A', earnings: 5000 },
//     { name: 'Provider B', earnings: 4200 },
//     { name: 'Provider C', earnings: 3800 },
//     { name: 'Provider D', earnings: 3500 },
//     { name: 'Provider E', earnings: 2900 }
//   ];

//   const weeklyPattern = [
//     { day: 'Mon', value: 85 },
//     { day: 'Tue', value: 70 },
//     { day: 'Wed', value: 60 },
//     { day: 'Thu', value: 75 },
//     { day: 'Fri', value: 90 },
//     { day: 'Sat', value: 65 },
//     { day: 'Sun', value: 55 }
//   ];

//   const bookingTrends = [
//     { month: 'Jan', value: 65 },
//     { month: 'Feb', value: 72 },
//     { month: 'Mar', value: 58 },
//     { month: 'Apr', value: 78 },
//     { month: 'May', value: 85 },
//     { month: 'Jun', value: 92 },
//     { month: 'Jul', value: 88 }
//   ];

//   const maxProvider = Math.max(...providers.map(p => p.earnings));
//   const maxWeekly = Math.max(...weeklyPattern.map(d => d.value));
//   const maxBooking = Math.max(...bookingTrends.map(t => t.value));

//   return (
//     <div className="w-full bg-gray-50 min-h-screen p-4 sm:p-6">
//       {/* Page Title */}
//       <div className="mb-4 sm:mb-6">
//         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
//         <p className="text-sm sm:text-base text-gray-600">
//           Gain insights into platform performance with comprehensive analytical tools
//         </p>
//       </div>

//       {/* Dashboard Content */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
//         {/* Top 5 Service Categories */}
//         <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between mb-4 sm:mb-6">
//             <div>
//               <h2 className="text-base sm:text-lg font-semibold text-gray-900">Top 5 Service Categories</h2>
//               <div className="flex items-end gap-3 mt-2">
//                 <p className="text-2xl sm:text-3xl font-bold text-gray-900">25%</p>
//                 <div className="flex items-center gap-1 text-green-600 mb-1">
//                   <TrendingUp size={16} />
//                   <span className="text-xs sm:text-sm font-medium">+5%</span>
//                 </div>
//               </div>
//               <p className="text-xs sm:text-sm text-gray-500 mt-1">This Month</p>
//             </div>
//           </div>
//           <div className="space-y-3 sm:space-y-4">
//             {serviceCategories.map((category, idx) => (
//               <div key={idx} className="space-y-2">
//                 <div className="flex justify-between text-xs sm:text-sm">
//                   <span className="text-gray-600">{category.name}</span>
//                   <span className="font-medium text-gray-900">{category.value}%</span>
//                 </div>
//                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
//                   <div 
//                     className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
//                     style={{ width: `${category.value * 4}%` }}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Booking Trends Over Time */}
//         <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <div className="mb-4 sm:mb-6">
//             <h2 className="text-base sm:text-lg font-semibold text-gray-900">Booking Trends Over Time</h2>
//             <div className="flex items-end gap-3 mt-2">
//               <p className="text-2xl sm:text-3xl font-bold text-gray-900">120</p>
//               <div className="flex items-center gap-1 text-green-600 mb-1">
//                 <TrendingUp size={16} />
//                 <span className="text-xs sm:text-sm font-medium">+10%</span>
//               </div>
//             </div>
//             <p className="text-xs sm:text-sm text-gray-500 mt-1">Last 3 Months</p>
//           </div>
//           <div className="h-40 sm:h-48 flex items-end justify-between gap-1 sm:gap-2">
//             {bookingTrends.map((trend, idx) => (
//               <div key={idx} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
//                 <div className="w-full relative h-32 sm:h-40">
//                   <div 
//                     className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
//                     style={{ height: `${(trend.value / maxBooking) * 100}%` }}
//                     title={`${trend.month}: ${trend.value}`}
//                   />
//                 </div>
//                 <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{trend.month}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
//         {/* Booking Time Patterns */}
//         <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <div className="mb-4 sm:mb-6">
//             <h2 className="text-base sm:text-lg font-semibold text-gray-900">Booking Time Patterns</h2>
//             <div className="flex items-end gap-3 mt-2">
//               <p className="text-2xl sm:text-3xl font-bold text-gray-900">100</p>
//               <div className="flex items-center gap-1 text-green-600 mb-1">
//                 <TrendingUp size={16} />
//                 <span className="text-xs sm:text-sm font-medium">+20%</span>
//               </div>
//             </div>
//             <p className="text-xs sm:text-sm text-gray-500 mt-1">This Week</p>
//           </div>
//           <div className="h-40 sm:h-48 flex items-end justify-between gap-2 sm:gap-3">
//             {weeklyPattern.map((day, idx) => (
//               <div key={idx} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
//                 <div className="w-full relative h-32 sm:h-40">
//                   <div 
//                     className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-purple-500 cursor-pointer"
//                     style={{ height: `${(day.value / maxWeekly) * 100}%` }}
//                     title={`${day.day}: ${day.value}`}
//                   />
//                 </div>
//                 <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{day.day}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Top Providers by Earnings */}
//         <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <div className="mb-4 sm:mb-6">
//             <h2 className="text-base sm:text-lg font-semibold text-gray-900">Top Providers by Earnings</h2>
//             <div className="flex items-end gap-3 mt-2">
//               <p className="text-2xl sm:text-3xl font-bold text-gray-900">$5,000</p>
//               <div className="flex items-center gap-1 text-green-600 mb-1">
//                 <TrendingUp size={16} />
//                 <span className="text-xs sm:text-sm font-medium">+25%</span>
//               </div>
//             </div>
//             <p className="text-xs sm:text-sm text-gray-500 mt-1">This Month</p>
//           </div>
//           <div className="space-y-3 sm:space-y-4">
//             {providers.map((provider, idx) => (
//               <div key={idx} className="flex items-center gap-2 sm:gap-4">
//                 <span className="text-xs sm:text-sm text-gray-500 w-20 sm:w-24 flex-shrink-0">{provider.name}</span>
//                 <div className="flex-1 h-7 sm:h-8 bg-gray-100 rounded-lg overflow-hidden">
//                   <div 
//                     className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500 hover:from-emerald-600 hover:to-emerald-500 cursor-pointer"
//                     style={{ width: `${(provider.earnings / maxProvider) * 100}%` }}
//                   >
//                     <span className="text-[10px] sm:text-xs font-medium text-white">
//                       ${provider.earnings.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Additional Stats Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
//         <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Bookings</h3>
//           <div className="flex items-end justify-between">
//             <p className="text-2xl sm:text-3xl font-bold text-gray-900">1,234</p>
//             <div className="flex items-center gap-1 text-green-600">
//               <TrendingUp size={14} />
//               <span className="text-xs font-medium">+12%</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Active Users</h3>
//           <div className="flex items-end justify-between">
//             <p className="text-2xl sm:text-3xl font-bold text-gray-900">856</p>
//             <div className="flex items-center gap-1 text-green-600">
//               <TrendingUp size={14} />
//               <span className="text-xs font-medium">+8%</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Revenue</h3>
//           <div className="flex items-end justify-between">
//             <p className="text-2xl sm:text-3xl font-bold text-gray-900">$45.2K</p>
//             <div className="flex items-center gap-1 text-green-600">
//               <TrendingUp size={14} />
//               <span className="text-xs font-medium">+18%</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Avg. Rating</h3>
//           <div className="flex items-end justify-between">
//             <p className="text-2xl sm:text-3xl font-bold text-gray-900">4.8</p>
//             <div className="flex items-center gap-1 text-green-600">
//               <TrendingUp size={14} />
//               <span className="text-xs font-medium">+0.3</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalyticsDashboard;



import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { adminService } from '../../services/adminService'; // Adjust this import path

// --- TypeScript Interfaces to match the API response ---
interface ChartDataPoint {
  name: string;
  value: number;
}
interface MonthlyTrendPoint {
  month: string;
  value: number;
}
interface DailyPatternPoint {
  day: string;
  value: number;
}
interface ProviderData {
  name: string;
  earnings: number;
}
interface KpiData {
  totalBookings: number;
  activeUsers: number;
  revenue: number;
  avgRating: number;
}
interface AnalyticsData {
  topServiceCategories: ChartDataPoint[];
  bookingTrends: MonthlyTrendPoint[];
  weeklyPattern: DailyPatternPoint[];
  topProviders: ProviderData[];
  kpi: KpiData;
}

const AnalyticsDashboard: React.FC = () => {
  // --- State for dynamic data, loading, and errors ---
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data fetching on component mount ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // We use the getDashboardAnalytics function from your adminService
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
  }, []); // Empty dependency array ensures this runs only once

  // --- UI for Loading and Error States ---
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-600">Loading Analytics Dashboard...</div>;
  }

  if (error || !analyticsData) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-500">{error || "No analytics data is available."}</div>;
  }

  // --- Destructure for easier access in JSX ---
  const { topServiceCategories, bookingTrends, weeklyPattern, topProviders, kpi } = analyticsData;

  // --- Calculate max values for bar charts dynamically ---
  const maxProvider = Math.max(...topProviders.map(p => p.earnings), 0) || 1;
  const maxWeekly = Math.max(...weeklyPattern.map(d => d.value), 0) || 1;
  const maxBooking = Math.max(...bookingTrends.map(t => t.value), 0) || 1;

  const topCategoryValue = topServiceCategories[0]?.value || 0;
  const topProviderValue = topProviders[0]?.earnings || 0;
  const topBookingTrend = Math.max(...bookingTrends.map(t => t.value), 0);

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* Page Title */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Gain insights into platform performance with comprehensive analytical tools
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Top 5 Service Categories */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Top 5 Service Categories</h2>
              <div className="flex items-end gap-3 mt-2">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{topCategoryValue}%</p>
                {/* Trend data for this specific metric is not available from the backend yet */}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Of Top Bookings</p>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {topServiceCategories.map((category, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">{category.name}</span>
                  <span className="font-medium text-gray-900">{category.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${category.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Trends Over Time */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Booking Trends Over Time</h2>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{topBookingTrend}</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Bookings this month</p>
          </div>
          <div className="h-40 sm:h-48 flex items-end justify-between gap-1 sm:gap-2">
            {bookingTrends.map((trend, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                <div className="w-full relative h-32 sm:h-40">
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer" style={{ height: `${(trend.value / maxBooking) * 100}%` }} title={`${trend.month}: ${trend.value}`} />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{trend.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Booking Time Patterns */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Weekly Booking Pattern</h2>
          </div>
          <div className="h-40 sm:h-48 flex items-end justify-between gap-2 sm:gap-3">
            {weeklyPattern.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                <div className="w-full relative h-32 sm:h-40">
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-purple-500 cursor-pointer" style={{ height: `${(day.value / maxWeekly) * 100}%` }} title={`${day.day}: ${day.value}`} />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Providers by Earnings */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Top Providers by Earnings</h2>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">${topProviderValue.toLocaleString()}</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Top earner this month</p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {topProviders.map((provider, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-500 w-20 sm:w-24 flex-shrink-0">{provider.name}</span>
                <div className="flex-1 h-7 sm:h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500 hover:from-emerald-600 hover:to-emerald-500 cursor-pointer" style={{ width: `${(provider.earnings / maxProvider) * 100}%` }} >
                    <span className="text-[10px] sm:text-xs font-medium text-white">${provider.earnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Bookings</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{kpi.totalBookings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Active Users</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{kpi.activeUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">${kpi.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Avg. Rating</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{kpi.avgRating}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
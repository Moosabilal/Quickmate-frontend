import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { DailyBooking, MonthlyRevenue, DashboardData } from '../../util/interface/IAdminDashboard';


const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getAdminDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminService.fetchAdminDashboard();
      setDashboardData(response as DashboardData);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(typeof err === 'string' ? err : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminDashboard();
  }, []);

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const prepareDailyBookingsChart = (dailyBookings?: DailyBooking[]) => {
    const map = new Map<string, number>();
    dailyBookings?.forEach(item => {
      const d = new Date(item.date);
      const weekday = isNaN(d.getTime()) ? item.date : d.toLocaleDateString("en-US", { weekday: "short" });
      map.set(weekday, (map.get(weekday) || 0) + (item.total ?? 0));
    });

    return WEEKDAYS.map(day => ({
      date: day,
      bookings: map.get(day) || 0,
    }));
  };

  const prepareMonthlyRevenueChart = (monthlyRevenue?: MonthlyRevenue[]) => {
    const map = new Map<string, number>();
    monthlyRevenue?.forEach(item => {
      const d = new Date(item.month + "-01");
      const label = isNaN(d.getTime()) ? item.month : d.toLocaleDateString("en-US", { month: "short" });
      map.set(label, item.total ?? 0);
    });

    return MONTHS.map(month => ({
      month,
      revenue: map.get(month) || 0,
      fullMonth: month,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button onClick={getAdminDashboard} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">No dashboard data available.</p>
        <button onClick={getAdminDashboard} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
          Reload
        </button>
      </div>
    );
  }

  const { totalUsers, totalProviders, totalBookings, monthlyRevenue, dailyBookings, topActiveProviders } = dashboardData;

  const monthlyChart = prepareMonthlyRevenueChart(monthlyRevenue);
  const dailyChart = prepareDailyBookingsChart(dailyBookings);
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentMonthRevenue = monthlyChart[currentMonthIndex]?.revenue || 0;
  const prevMonthRevenue = monthlyChart[currentMonthIndex - 1]?.revenue || 0;

  const revenueGrowth = calculateGrowth(currentMonthRevenue, prevMonthRevenue);

  const currentBookingIndex = now.getDay()
  const currentDayBookings = dailyChart[currentBookingIndex]?.bookings || 0;
  const prevDayBookings = dailyChart[currentBookingIndex - 1]?.bookings || 0;
  const bookingGrowth = calculateGrowth(currentDayBookings, prevDayBookings);

  const dashboardStats = [
    { label: 'Total Users', value: totalUsers?.toLocaleString() ?? '0' },
    { label: 'Total Service Providers', value: totalProviders?.toLocaleString() ?? '0' },
    { label: 'Total Bookings', value: totalBookings?.toLocaleString() ?? '0' },
    { label: 'Revenue This Month', value: formatCurrency(currentMonthRevenue) },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Overview of key metrics and recent activities</p>
            </div>
            <button onClick={getAdminDashboard} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Refresh Data
            </button>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-4">Monthly Revenue</h3>
              <p className="text-3xl font-bold">{formatCurrency(currentMonthRevenue)}</p>
              <p className={`text-sm mt-1 ${+revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {+revenueGrowth >= 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`} vs last month
              </p>
              <div className="h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-4">Daily Bookings</h3>
              <p className="text-3xl font-bold">{currentDayBookings}</p>
              <p className={`text-sm mt-1 ${+bookingGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {+bookingGrowth >= 0 ? `+${bookingGrowth}%` : `${bookingGrowth}%`} vs previous day
              </p>
              <div className="h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [value, 'Bookings']} />
                    <Bar dataKey="bookings" fill="#10B981" radius={[8, 8, 4, 4]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Top Active Providers</h3>
            {topActiveProviders && topActiveProviders.length > 0 ? (
              <div className="space-y-4">
                {topActiveProviders.map((provider) => (
                  <div key={provider._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {provider.fullName ? provider.fullName.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <p className="font-medium">{provider.fullName || 'Unknown Provider'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {provider.rating ?? 'No rating'} ★ ({provider.reviewCount ?? 0} reviews) • {provider.totalBookings ?? 0} bookings
                        </p>
                      </div>
                    </div>
                    <Link to={`/admin/providers/${provider._id}`} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No provider data available</div>
            )}
          </section>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/admin/users"
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Manage Users</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">View and manage user accounts</p>
            </Link>

            <Link
              to="/admin/providers"
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Manage Providers</h4>
              <p className="text-sm text-green-700 dark:text-green-300">Review and verify service providers</p>
            </Link>

            <Link
              to="/admin/bookings"
              className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">View Bookings</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">Monitor all booking activities</p>
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

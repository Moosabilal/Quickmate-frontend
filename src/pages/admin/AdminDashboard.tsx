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
import { 
  Users, 
  Briefcase, 
  CalendarCheck, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Shield,
  UserCheck,
  Calendar
} from 'lucide-react';
import { CustomTooltipProps } from '../../util/interface/IAdmin';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CustomChartTooltip = ({ active, payload, label, prefix = '' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-700 p-4 border border-gray-100 dark:border-gray-600 rounded-xl shadow-lg transition-colors duration-200">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {payload[0].name}: {prefix}{typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

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
      // Background updated to gray-700
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-700 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      // Background updated to gray-700
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-700 transition-colors duration-300">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md mx-4">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-6 font-medium">{error}</p>
          <button onClick={getAdminDashboard} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { totalUsers, totalProviders, totalBookings, monthlyRevenue, dailyBookings, topActiveProviders } = dashboardData;

  const monthlyChart = prepareMonthlyRevenueChart(monthlyRevenue);
  const dailyChart = prepareDailyBookingsChart(dailyBookings);
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentMonthRevenue = monthlyChart[currentMonthIndex]?.revenue || 0;
  const prevMonthRevenue = monthlyChart[currentMonthIndex - 1]?.revenue || 0;

  const revenueGrowth = calculateGrowth(currentMonthRevenue, prevMonthRevenue);
  const revenueGrowthNum = parseFloat(revenueGrowth as string);

  const currentBookingIndex = now.getDay()
  const currentDayBookings = dailyChart[currentBookingIndex]?.bookings || 0;
  const prevDayBookings = dailyChart[currentBookingIndex - 1]?.bookings || 0;
  const bookingGrowth = calculateGrowth(currentDayBookings, prevDayBookings);
  const bookingGrowthNum = parseFloat(bookingGrowth as string);

  const dashboardStats = [
    { label: 'Total Users', value: totalUsers?.toLocaleString() ?? '0', icon: <Users className="w-6 h-6" />, color: 'blue' },
    { label: 'Service Providers', value: totalProviders?.toLocaleString() ?? '0', icon: <Briefcase className="w-6 h-6" />, color: 'purple' },
    { label: 'Total Bookings', value: totalBookings?.toLocaleString() ?? '0', icon: <CalendarCheck className="w-6 h-6" />, color: 'green' },
    { label: 'Monthly Revenue', value: formatCurrency(currentMonthRevenue), icon: <DollarSign className="w-6 h-6" />, color: 'amber' },
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300';
      case 'purple': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300';
      case 'green': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'amber': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    // Main Container Background updated to gray-700
    <div className="min-h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="flex-1 flex flex-col h-full">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-300 mt-1">Welcome back, here's what's happening today.</p>
            </div>
            <button 
              onClick={getAdminDashboard} 
              // Button bg updated to gray-800
              className="flex items-center gap-2 bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600 transition-all shadow-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, i) => (
              // Cards updated to gray-800 to stand out against gray-700 bg
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600 p-6 transition-colors hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${getColorClass(stat.color)}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Revenue Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600 p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Overview</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Monthly revenue analytics</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${revenueGrowthNum >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                  {revenueGrowthNum >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(revenueGrowthNum)}%
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChart} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      tickFormatter={(v) => `₹${v/1000}k`} 
                    />
                    <Tooltip content={<CustomChartTooltip prefix="₹" />} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bookings Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600 p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Bookings</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Booking activity for this week</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${bookingGrowthNum >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                  {bookingGrowthNum >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(bookingGrowthNum)}%
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChart} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar 
                      dataKey="bookings" 
                      fill="#10B981" 
                      radius={[6, 6, 0, 0]} 
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Top Providers & Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Top Active Providers */}
            <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Performing Providers</h3>
                <Link to="/admin/providers" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline">
                  View All
                </Link>
              </div>
              
              {topActiveProviders && topActiveProviders.length > 0 ? (
                <div className="space-y-4">
                  {topActiveProviders.map((provider) => (
                    <div key={provider._id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shadow-sm">
                          {provider.fullName ? provider.fullName.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {provider.fullName || 'Unknown Provider'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 rounded">
                              <span className="text-xs">★</span> {provider.rating?.toFixed(1) ?? 'N/A'}
                            </span>
                            <span>• {provider.totalBookings ?? 0} bookings</span>
                          </div>
                        </div>
                      </div>
                      <Link to={`/admin/providers/${provider._id}`} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <TrendingUp className="w-5 h-5" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Briefcase className="w-12 h-12 mb-3 opacity-20" />
                  <p>No provider data available</p>
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 px-1">Quick Actions</h3>
              
              <Link to="/admin/users" className="group p-5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Manage Users</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View active users and manage accounts</p>
                  </div>
                </div>
              </Link>

              <Link to="/admin/providers" className="group p-5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-2xl hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Verify Providers</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review pending provider applications</p>
                  </div>
                </div>
              </Link>

              <Link to="/admin/bookings" className="group p-5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Booking Overview</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor daily booking activities</p>
                  </div>
                </div>
              </Link>
            </section>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
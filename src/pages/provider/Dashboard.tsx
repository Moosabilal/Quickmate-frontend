import React, { useEffect, useState } from 'react';
import {
    Calendar,
    Star,
    IndianRupee,
    Users,
    Eye
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useAppSelector } from '../../hooks/useAppSelector';
import { StatCard } from '../../components/provider/StatusCard';
import { Booking, IDashboardResponse, IDashboardStatus, RatingHistoryPoint, Stats } from '../../util/interface/IProvider';
import { providerService } from '../../services/providerService';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { useNavigate } from 'react-router-dom';


const Dashboard: React.FC = () => {
    const { user } = useAppSelector(state => state.auth)
    const [dashboardData, setDashboardData] = useState<IDashboardResponse[]>([]);
    const [dashboardStat, setDashboardStat] = useState<IDashboardStatus | null>(null);

    const [dashboard, setDashboard] = useState<{
        dashboardData: Booking[];
        dashboardStat: Stats;
    }>({ dashboardData: [], dashboardStat: {} as Stats });

    const navigate = useNavigate()

    const getProviderDashboard = async () => {
        try {
            const response = await providerService.getProviderDash()
            setDashboardData(response.dashboardData || []);
            setDashboardStat(response.dashboardStat || null);
            setDashboard(response);
        } catch (error) {
            console.log('Error in fetchign dashboard', error)
        }

    }

    useEffect(() => {
        getProviderDashboard()
    }, [])

    const fiscalMonths = [
        "Apr", "May", "Jun", "Jul", "Aug", "Sept",
        "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
    ];

    function normalizeRatingHistory(data: RatingHistoryPoint[]): RatingHistoryPoint[] {
        const map = new Map(data.map((d) => [d.month, d.rating]));
        return fiscalMonths.map((m) => ({
            month: m,
            rating: map.has(m) ? map.get(m)! : 0,
        }));
    }


    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'upcoming': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Here's what's happening with your services today.</p>
                        </div>
                    </div>
                </div>

                {dashboardStat && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
                        <StatCard
                            title="Earnings"
                            value={dashboardStat.earnings}
                            change={0}
                            prefix="₹"
                            icon={<IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        />
                        <StatCard
                            title="Completed Jobs"
                            value={dashboardStat.completedJobs}
                            change={0}
                            icon={<Users className="w-5 h-5 text-green-600 dark:text-green-400" />}
                        />
                        <StatCard
                            title="Upcoming Bookings"
                            value={dashboardStat.upcomingBookings}
                            change={0}
                            icon={<Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                        />
                        <StatCard
                            title="Average Rating"
                            value={dashboardStat.averageRating ?? 0}
                            change={0}
                            icon={<Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bookings Timeline Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bookings Timeline</h2>
                                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <Eye className="w-4 h-4" />
                                    <span onClick={() => navigate('/provider/providerBookingManagement')} >View All</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {dashboardData.length > 0 ? (
                                    dashboardData.map((booking) => (
                                        <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300">
                                            <div className="flex items-start space-x-4">
                                                <img
                                                    src={getCloudinaryUrl(booking.image)}
                                                    alt={booking.service}
                                                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 dark:bg-gray-700"
                                                />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                                {booking.service}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                {booking.client}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                booking.status
                                                            )}`}
                                                        >
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        {booking.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))) : (
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No bookings found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rating Trends Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rating Trends</h2>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {dashboard.dashboardStat?.averageRating
                                            ? dashboard.dashboardStat.averageRating.toFixed(1)
                                            : "0.0"}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-500">Last 30 Days</p>
                            </div>

                            <div className="mt-6 h-56 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={normalizeRatingHistory(dashboard.dashboardStat?.ratingHistory || [])}
                                        margin={{ top: 10, right: 20, left: -40, bottom: 10 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>

                                        {/* Grid lines: using a neutral gray that works on both, slightly visible */}
                                        <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.2} vertical={false} />
                                        
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12, fill: "#9CA3AF" }} // Gray-400 works on both backgrounds
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 5]}
                                            ticks={[1, 2, 3, 4, 5]}
                                            tick={{ fontSize: 12, fill: "#9CA3AF" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "white", 
                                                // Kept white for contrast in both modes, or you can check theme state if available
                                                borderRadius: "8px",
                                                border: "1px solid #e5e7eb",
                                                boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                                                padding: "8px 12px",
                                                color: "#111827" // Always dark text inside the white tooltip
                                            }}
                                            formatter={(value: any) =>
                                                typeof value === "number"
                                                    ? [`⭐ ${value.toFixed(1)}`, "Rating"]
                                                    : ["No Data", ""]
                                            }
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="rating"
                                            stroke="#2563eb"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4,
                                                fill: "#2563eb",
                                                strokeWidth: 2,
                                                stroke: "#fff",
                                            }}
                                            activeDot={{
                                                r: 7,
                                                fill: "#1d4ed8",
                                                strokeWidth: 2,
                                                stroke: "#fff",
                                            }}
                                            connectNulls={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="rating"
                                            stroke="none"
                                            fill="url(#colorRating)"
                                            connectNulls={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
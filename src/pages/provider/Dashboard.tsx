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
            case 'upcoming': return 'bg-yellow-100 text-yellow-800';
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
                            <p className="text-gray-600 mt-1">Here's what's happening with your services today.</p>
                        </div>
                        {/* <div className="flex items-center space-x-3">
                            <select
                                value={timeFrame}
                                onChange={handleTimeFrameChange}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option>This Week</option>
                                <option>Last Week</option>
                                <option>This Month</option>
                                <option>Last Month</option>
                            </select>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div> */}
                    </div>
                </div>

                {dashboardStat && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
                        <StatCard
                            title="Earnings"
                            value={dashboardStat.earnings}
                            change={0}
                            prefix="₹"
                            icon={<IndianRupee className="w-5 h-5 text-blue-600" />}
                        />
                        <StatCard
                            title="Completed Jobs"
                            value={dashboardStat.completedJobs}
                            change={0}
                            icon={<Users className="w-5 h-5 text-green-600" />}
                        />
                        <StatCard
                            title="Upcoming Bookings"
                            value={dashboardStat.upcomingBookings}
                            change={0}
                            icon={<Calendar className="w-5 h-5 text-purple-600" />}
                        />
                        <StatCard
                            title="Average Rating"
                            value={dashboardStat.averageRating ?? 0}
                            change={0}
                            icon={<Star className="w-5 h-5 text-yellow-600" />}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Bookings Timeline</h2>
                                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                                    <Eye className="w-4 h-4" />
                                    <span onClick={() => navigate('/provider/providerBookingManagement')} >View All</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {dashboardData.length > 0 ? (
                                    dashboardData.map((booking) => (
                                        <div key={booking.id} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                                            <div className="flex items-start space-x-4">
                                                <img
                                                    src={getCloudinaryUrl(booking.image)}
                                                    alt={booking.service}
                                                    className="w-16 h-16 rounded-xl object-cover"
                                                />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                                {booking.service}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 mt-1">
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
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {booking.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))) : (
                                    <div>
                                        <p className="text-gray-500 text-sm">No bookings found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Rating Trends</h2>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600">Average Rating</p>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {dashboard.dashboardStat?.averageRating
                                            ? dashboard.dashboardStat.averageRating.toFixed(1)
                                            : "0.0"}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">Last 30 Days</p>
                            </div>

                            <div className="mt-6 h-56 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm">
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

                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12, fill: "#6b7280" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 5]}
                                            ticks={[1, 2, 3, 4, 5]}
                                            tick={{ fontSize: 12, fill: "#6b7280" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "white",
                                                borderRadius: "8px",
                                                border: "1px solid #e5e7eb",
                                                boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                                                padding: "8px 12px",
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
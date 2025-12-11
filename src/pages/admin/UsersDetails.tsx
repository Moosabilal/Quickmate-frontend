import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Mail, Phone, Calendar, LogIn, Hash, CheckCircle,
    XCircle, Clock, Ban, ShieldCheck, AlertTriangle, Loader2,
    ArrowLeft
} from 'lucide-react';
import { authService } from '../../services/authService';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { IUserDetailsResponse } from '../../util/interface/IUser';
import { StatusBadge } from '../../components/admin/UserStatusBadge';
import { StatCard } from '../../components/admin/UserStatCard';

const UserDetailsPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<IUserDetailsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!userId) {
                setError("User ID is missing.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await authService.getUserDetailsForAdmin(userId);
                setUser(response);
            } catch (err) {
                setError("Failed to fetch user details. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId]);

    const handleToggleStatus = async () => {
        if (!user) return;
        try {
            setUser(prevUser => prevUser ? { ...prevUser, isActive: !prevUser.isActive } : null);
            await authService.updateUser(user.id);
        } catch (err) {
            setUser(prevUser => prevUser ? { ...prevUser, isActive: !prevUser.isActive } : null);
            alert("Failed to update user status.");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-700 transition-colors duration-300">
                <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-700 text-red-600 dark:text-red-400 transition-colors duration-300">
                <AlertTriangle className="w-8 h-8 mr-4" />
                <p className="text-xl">{error}</p>
            </div>
        );
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-700 text-slate-600 dark:text-gray-400">No user data found.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-700 text-slate-800 dark:text-gray-100 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="self-start flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1 pl-0 rounded-md group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">User Details</h1>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-gray-600/50 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <img
                            src={user.avatarUrl ? getCloudinaryUrl(user.avatarUrl) : '/profileImage.png'}
                            alt={user.name}
                            className="w-24 h-24 rounded-full border-4 border-indigo-200 dark:border-indigo-900/50 object-cover"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">User ID: {user.id}</p>
                            <span className={`mt-3 inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${user.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'}`}>
                                <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                {user.isActive ? 'Active' : 'Blocked'}
                            </span>
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                        {user.isActive ? (
                            <button
                                onClick={handleToggleStatus}
                                className="w-full md:w-auto px-6 py-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-transparent dark:border-red-800/50 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
                                <Ban className="w-5 h-5" />
                                <span>Block User</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleToggleStatus}
                                className="w-full md:w-auto px-6 py-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-transparent dark:border-green-800/50 font-semibold rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors flex items-center justify-center gap-2">
                                <ShieldCheck className="w-5 h-5" />
                                <span>Unblock User</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-600/50 space-y-4 transition-colors duration-300">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-3 mb-4">Basic Information</h3>
                        <div className="flex items-center text-sm">
                            <Mail className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-4 flex-shrink-0" />
                            <div className="flex flex-col sm:flex-row sm:gap-2 w-full">
                                <span className="text-slate-500 dark:text-gray-400 w-32">Email</span>
                                <span className="font-medium text-slate-700 dark:text-gray-200 truncate">{user.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-sm">
                            <Phone className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-4 flex-shrink-0" />
                            <div className="flex flex-col sm:flex-row sm:gap-2 w-full">
                                <span className="text-slate-500 dark:text-gray-400 w-32">Phone Number</span>
                                <span className="font-medium text-slate-700 dark:text-gray-200">{user.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-600/50 space-y-4 transition-colors duration-300">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-3 mb-4">Account Details</h3>
                        <div className="flex items-center text-sm">
                            <Calendar className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-4 flex-shrink-0" />
                            <div className="flex flex-col sm:flex-row sm:gap-2 w-full">
                                <span className="text-slate-500 dark:text-gray-400 w-32">Registration Date</span>
                                <span className="font-medium text-slate-700 dark:text-gray-200">{user.registrationDate}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-sm">
                            <LogIn className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-4 flex-shrink-0" />
                            <div className="flex flex-col sm:flex-row sm:gap-2 w-full">
                                <span className="text-slate-500 dark:text-gray-400 w-32">Last Login</span>
                                <span className="font-medium text-slate-700 dark:text-gray-200">{user.lastLogin}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-600/50 space-y-4 transition-colors duration-300">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-3 mb-4">Booking Metrics</h3>
                        <div className="flex items-center text-sm">
                            <Hash className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-4 flex-shrink-0" />
                            <div className="flex flex-col sm:flex-row sm:gap-2 w-full">
                                <span className="text-slate-500 dark:text-gray-400 w-32">Total Bookings</span>
                                <span className="font-medium text-slate-700 dark:text-gray-200">{user.totalBookings}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-gray-600/50 transition-colors duration-300">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Booking History</h3>

                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <StatCard
                            title="Completed"
                            value={user.bookingStats.completed}
                            icon={<CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />}
                            colorClasses="bg-green-100 dark:bg-green-900/30"
                        />
                        <StatCard
                            title="Canceled"
                            value={user.bookingStats.canceled}
                            icon={<XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
                            colorClasses="bg-red-100 dark:bg-red-900/30"
                        />
                        <StatCard
                            title="Pending"
                            value={user.bookingStats.pending}
                            icon={<Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
                            colorClasses="bg-yellow-100 dark:bg-yellow-900/30"
                        />
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-gray-700">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-700 text-sm text-slate-500 dark:text-gray-300">
                                <tr>
                                    <th className="p-4 font-semibold">Provider</th>
                                    <th className="p-4 font-semibold">Service</th>
                                    <th className="p-4 font-semibold">Booking Date</th>
                                    <th className="p-4 font-semibold">Service Date</th>
                                    <th className="p-4 text-center font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                                {user.bookingHistory.length > 0 ? (
                                    user.bookingHistory.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="p-4 font-medium text-slate-700 dark:text-gray-200">{booking.providerName}</td>
                                            <td className="p-4 text-slate-600 dark:text-gray-300">{booking.service}</td>
                                            <td className="p-4 text-slate-600 dark:text-gray-300 text-sm">{booking.bookingDate}</td>
                                            <td className="p-4 text-slate-600 dark:text-gray-300 text-sm">{booking.serviceDate}</td>
                                            <td className="p-4 text-center">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-gray-400">
                                            No booking history available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPage;
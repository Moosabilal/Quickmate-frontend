import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    User, Mail, Phone, Calendar, LogIn, Hash, CheckCircle,
    XCircle, Clock, Briefcase, Ban, ShieldCheck, AlertTriangle, Loader2
} from 'lucide-react';
import { authService } from '../../services/authService'; 
import { getCloudinaryUrl } from '../../util/cloudinary';
import { IBookingDetailsForAdmin, IUserDetailsResponse } from '../../util/interface/IUser';
import { RenderableStatus, StatusStyle } from '../../util/interface/IUser';
import { BookingStatus } from '../../util/interface/IBooking';

const statusStyles: Record<RenderableStatus, StatusStyle> = {
    [BookingStatus.COMPLETED]: { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
    [BookingStatus.CANCELLED]: { bgColor: 'bg-red-100', textColor: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
    [BookingStatus.PENDING]: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
    [BookingStatus.CONFIRMED]: { bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
    [BookingStatus.IN_PROGRESS]: { bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', icon: <Clock className="w-4 h-4" /> },
};


const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
    if (status === BookingStatus.All) {
        return null; 
    }
    
    const style = statusStyles[status as RenderableStatus] || statusStyles[BookingStatus.PENDING];

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${style.bgColor} ${style.textColor}`}>
            {style.icon}
            {status}
        </span>
    );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="flex-1 p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-6">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const UserDetailsPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<IUserDetailsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
                console.log('the frontend response', response)
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-600">
                <AlertTriangle className="w-8 h-8 mr-4" />
                <p className="text-xl">{error}</p>
            </div>
        );
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">No user data found.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                <h1 className="text-3xl font-bold text-slate-900">User Details</h1>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <img src={getCloudinaryUrl(user.avatarUrl)} alt={user.name} className="w-24 h-24 rounded-full border-4 border-indigo-200" />
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                            <p className="text-slate-500">User ID: {user.id}</p>
                            <span className={`mt-2 inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                {user.isActive ? 'Active' : 'Blocked'}
                            </span>
                        </div>
                    </div>
                     <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                        {user.isActive ? (
                             <button 
                                onClick={handleToggleStatus}
                                className="w-full sm:w-auto px-6 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2">
                                <Ban className="w-5 h-5" />
                                <span>Block User</span>
                            </button>
                        ) : (
                             <button
                                onClick={handleToggleStatus}
                                className="w-full sm:w-auto px-6 py-3 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2">
                                <ShieldCheck className="w-5 h-5" />
                                <span>Unblock User</span>
                            </button>
                        )}
                        {/* <button className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            <span>Create as Provider</span>
                        </button> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                         <h3 className="text-lg font-semibold text-slate-800 border-b pb-3 mb-4">Basic Information</h3>
                         <div className="flex items-center text-sm">
                            <Mail className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Email</span>
                            <span className="font-medium text-slate-700">{user.email}</span>
                         </div>
                         <div className="flex items-center text-sm">
                            <Phone className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Phone Number</span>
                            <span className="font-medium text-slate-700">{user.phone}</span>
                         </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                         <h3 className="text-lg font-semibold text-slate-800 border-b pb-3 mb-4">Account Details</h3>
                         <div className="flex items-center text-sm">
                            <Calendar className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Registration Date</span>
                            <span className="font-medium text-slate-700">{user.registrationDate}</span>
                         </div>
                         <div className="flex items-center text-sm">
                            <LogIn className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Last Login</span>
                            <span className="font-medium text-slate-700">{user.lastLogin}</span>
                         </div>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                         <h3 className="text-lg font-semibold text-slate-800 border-b pb-3 mb-4">Booking Metrics</h3>
                         <div className="flex items-center text-sm">
                            <Hash className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Total Bookings</span>
                            <span className="font-medium text-slate-700">{user.totalBookings}</span>
                         </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Booking History</h3>
                    
                    <div className="flex flex-col sm:flex-row gap-6 mb-8">
                        <StatCard title="Completed" value={user.bookingStats.completed} icon={<CheckCircle className="w-6 h-6 text-green-600" />} color="bg-green-100" />
                        <StatCard title="Canceled" value={user.bookingStats.canceled} icon={<XCircle className="w-6 h-6 text-red-600" />} color="bg-red-100" />
                        <StatCard title="Pending" value={user.bookingStats.pending} icon={<Clock className="w-6 h-6 text-yellow-600" />} color="bg-yellow-100" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b-2 border-slate-200 text-sm text-slate-500">
                                <tr>
                                    <th className="p-4">Booking ID</th>
                                    <th className="p-4">Service</th>
                                    <th className="p-4">Booking Date</th>
                                    <th className="p-4">Service Date</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {user.bookingHistory.map((booking) => (
                                    <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-700">{booking.providerName}</td>
                                        <td className="p-4">{booking.service}</td>
                                        <td className="p-4">{booking.bookingDate}</td>
                                        <td className="p-4">{booking.serviceDate}</td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPage;
import React from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    LogIn,
    Hash,
    CheckCircle,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    Briefcase
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface IBooking {
    id: string;
    service: string;
    bookingDate: string;
    serviceDate: string;
    status: 'Completed' | 'Canceled' | 'Pending';
}

interface IUser {
    id: string;
    name: string;
    avatarUrl: string;
    email: string;
    phone: string;
    registrationDate: string;
    lastLogin: string;
    totalBookings: number;
    isActive: boolean;
}

// --- MOCK DATA (Replace with your actual data) ---
const userDetails: IUser = {
    id: '123456',
    name: 'Sophia Carter',
    avatarUrl: 'https://i.pravatar.cc/150?u=sophia.carter',
    email: 'sophia.carter@email.com',
    phone: '+1 (555) 123-4567',
    registrationDate: '2022-01-15',
    lastLogin: '2024-03-20',
    totalBookings: 25,
    isActive: true,
};

const bookingHistory: IBooking[] = [
    { id: 'BK12345', service: 'Photography Session', bookingDate: '2024-03-15', serviceDate: '2024-03-15', status: 'Completed' },
    { id: 'BK67890', service: 'Catering Service', bookingDate: '2024-03-10', serviceDate: '2024-03-15', status: 'Completed' },
    { id: 'BK24880', service: 'Event Planning', bookingDate: '2024-03-05', serviceDate: '2024-03-15', status: 'Canceled' },
    { id: 'BK13579', service: 'DJ Service', bookingDate: '2024-02-28', serviceDate: '2024-03-15', status: 'Completed' },
    { id: 'BK98765', service: 'Venue Rental', bookingDate: '2024-02-20', serviceDate: '2024-03-15', status: 'Pending' },
];


// --- HELPER COMPONENTS ---

// Status Badge Component
const StatusBadge: React.FC<{ status: 'Completed' | 'Canceled' | 'Pending' }> = ({ status }) => {
    const statusStyles = {
        Completed: {
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            icon: <CheckCircle className="w-4 h-4" />
        },
        Canceled: {
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            icon: <XCircle className="w-4 h-4" />
        },
        Pending: {
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            icon: <Clock className="w-4 h-4" />
        },
    };

    const { bgColor, textColor, icon } = statusStyles[status];

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${bgColor} ${textColor}`}>
            {icon}
            {status}
        </span>
    );
};

// Stat Card Component
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

// --- MAIN COMPONENT ---
const UserDetailsPage: React.FC = () => {
    const completedBookings = bookingHistory.filter(b => b.status === 'Completed').length;
    const canceledBookings = bookingHistory.filter(b => b.status === 'Canceled').length;
    const pendingBookings = bookingHistory.filter(b => b.status === 'Pending').length;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <h1 className="text-3xl font-bold text-slate-900">User Details</h1>

                {/* User Profile Card */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <img
                            src={userDetails.avatarUrl}
                            alt={userDetails.name}
                            className="w-24 h-24 rounded-full border-4 border-indigo-200"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{userDetails.name}</h2>
                            <p className="text-slate-500">User ID: {userDetails.id}</p>
                            <span className={`mt-2 inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${userDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <div className={`w-2 h-2 rounded-full ${userDetails.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                {userDetails.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        <span>Create as Provider</span>
                    </button>
                </div>

                {/* Basic Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                         <h3 className="text-lg font-semibold text-slate-800 border-b pb-3 mb-4">Basic Information</h3>
                         <div className="flex items-center text-sm">
                            <Mail className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Email</span>
                            <span className="font-medium text-slate-700">{userDetails.email}</span>
                         </div>
                         <div className="flex items-center text-sm">
                            <Phone className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Phone Number</span>
                            <span className="font-medium text-slate-700">{userDetails.phone}</span>
                         </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                         <h3 className="text-lg font-semibold text-slate-800 border-b pb-3 mb-4">Account Details</h3>
                         <div className="flex items-center text-sm">
                            <Calendar className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Registration Date</span>
                            <span className="font-medium text-slate-700">{userDetails.registrationDate}</span>
                         </div>
                         <div className="flex items-center text-sm">
                            <LogIn className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Last Login</span>
                            <span className="font-medium text-slate-700">{userDetails.lastLogin}</span>
                         </div>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                         <h3 className="text-lg font-semibold text-slate-800 border-b pb-3 mb-4">Booking Metrics</h3>
                         <div className="flex items-center text-sm">
                            <Hash className="w-5 h-5 text-slate-400 mr-4" />
                            <span className="text-slate-500 w-32">Total Bookings</span>
                            <span className="font-medium text-slate-700">{userDetails.totalBookings}</span>
                         </div>
                    </div>
                </div>

                {/* Booking History Section */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Booking History</h3>
                    
                    {/* Stat Cards */}
                    <div className="flex flex-col sm:flex-row gap-6 mb-8">
                        <StatCard title="Completed" value={completedBookings} icon={<CheckCircle className="w-6 h-6 text-green-600" />} color="bg-green-100" />
                        <StatCard title="Canceled" value={canceledBookings} icon={<XCircle className="w-6 h-6 text-red-600" />} color="bg-red-100" />
                        <StatCard title="Pending" value={pendingBookings} icon={<Clock className="w-6 h-6 text-yellow-600" />} color="bg-yellow-100" />
                    </div>

                    {/* Bookings Table */}
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
                                {bookingHistory.map((booking) => (
                                    <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-700">{booking.id}</td>
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

                     <div className="flex justify-center items-center mt-8 gap-2">
                        <button className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50" disabled>
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-semibold">1</button>
                        <button className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100">2</button>
                        <button className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100">3</button>
                        <button className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserDetailsPage;
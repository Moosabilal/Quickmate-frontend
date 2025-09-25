import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';

// --- TYPE DEFINITIONS (Import from a shared types file in your project) ---
type PaymentStatus = 'Paid' | 'Unpaid' | 'Refunded';
type BookingStatus = 'Completed' | 'Pending' | 'Canceled' | 'Ongoing';

interface IBookingLog {
  id: string;
  userName: string;
  userAvatar: string;
  providerName: string;
  serviceType: string;
  dateTime: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
}

// --- MOCK DATA (Replace this with data fetched from your API) ---
const mockBookings: IBookingLog[] = [
  { id: '#12345', userName: 'Sophia Carter', userAvatar: 'https://i.pravatar.cc/150?u=sophia', providerName: 'Tech Solutions Inc.', serviceType: 'IT Support', dateTime: '2024-03-15 10:00 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: '#12346', userName: 'Liam Harris', userAvatar: 'https://i.pravatar.cc/150?u=liam', providerName: 'Home Repair Experts', serviceType: 'Plumbing', dateTime: '2024-03-16 02:00 PM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: '#12347', userName: 'Olivia Turner', userAvatar: 'https://i.pravatar.cc/150?u=olivia', providerName: 'Creative Designs Co.', serviceType: 'Graphic Design', dateTime: '2024-03-17 09:00 AM', paymentStatus: 'Unpaid', bookingStatus: 'Pending' },
  { id: '#12348', userName: 'Noah Baker', userAvatar: 'https://i.pravatar.cc/150?u=noah', providerName: 'Fitness First', serviceType: 'Personal Training', dateTime: '2024-03-18 04:00 PM', paymentStatus: 'Paid', bookingStatus: 'Canceled' },
  { id: '#12349', userName: 'Ava Carter', userAvatar: 'https://i.pravatar.cc/150?u=ava', providerName: 'Event Planners LLC', serviceType: 'Event Planning', dateTime: '2024-03-19 11:00 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: '#12350', userName: 'Ethan Walker', userAvatar: 'https://i.pravatar.cc/150?u=ethan', providerName: 'Legal Aid Services', serviceType: 'Legal Consultation', dateTime: '2024-03-20 03:00 PM', paymentStatus: 'Refunded', bookingStatus: 'Canceled' },
];


// --- HELPER COMPONENTS ---

const StatusBadge: React.FC<{ status: PaymentStatus | BookingStatus }> = ({ status }) => {
    const statusStyles = {
        Paid: { bg: 'bg-green-100', text: 'text-green-800', icon: <DollarSign className="w-4 h-4" /> },
        Unpaid: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
        Refunded: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <DollarSign className="w-4 h-4" /> },
        Completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
        Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
        Canceled: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
        Ongoing: { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: <Clock className="w-4 h-4" /> },
    };

    const style = statusStyles[status] || statusStyles.Pending;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${style.bg} ${style.text}`}>
            {style.icon}
            {status}
        </span>
    );
};

const FilterDropdown: React.FC<{ label: string; options: string[] }> = ({ label, options }) => (
    <div className="relative">
        <select className="appearance-none w-full bg-white border border-slate-300 rounded-lg py-2 pl-4 pr-10 text-slate-700 leading-tight focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            <option>{label}</option>
            {options.map(option => <option key={option}>{option}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
            <ChevronDown className="w-4 h-4" />
        </div>
    </div>
);


// --- MAIN COMPONENT ---
const BookingLogsPage: React.FC = () => {
    const [bookings] = useState<IBookingLog[]>(mockBookings);
    
    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
                    <p className="text-slate-600 mt-1">Manage all bookings made on the platform.</p>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-200">
                    
                    {/* Filter Toolbar */}
                    <div className="p-6 border-b border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative md:col-span-2 lg:col-span-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by user or provider..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <FilterDropdown label="Booking Status" options={['Completed', 'Pending', 'Canceled']} />
                            <FilterDropdown label="Date Range" options={['Last 7 Days', 'Last 30 Days', 'This Month']} />
                            <FilterDropdown label="Service Type" options={['IT Support', 'Plumbing', 'Design']} />
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-sm text-slate-500 bg-slate-50">
                                <tr>
                                    <th className="p-4 font-medium">Booking ID</th>
                                    <th className="p-4 font-medium">User Name</th>
                                    <th className="p-4 font-medium">Provider Name</th>
                                    <th className="p-4 font-medium">Service Type</th>
                                    <th className="p-4 font-medium">Date & Time</th>
                                    <th className="p-4 font-medium text-center">Payment Status</th>
                                    <th className="p-4 font-medium text-center">Booking Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-700">{booking.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={booking.userAvatar} alt={booking.userName} className="w-9 h-9 rounded-full"/>
                                                <span>{booking.userName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{booking.providerName}</td>
                                        <td className="p-4">{booking.serviceType}</td>
                                        <td className="p-4">{booking.dateTime}</td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={booking.paymentStatus} />
                                        </td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={booking.bookingStatus} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                     <div className="flex justify-between items-center p-4 border-t border-slate-200">
                        <span className="text-sm text-slate-600">Showing 1 to {bookings.length} of {bookings.length} results</span>
                        <div className="flex items-center gap-2">
                            <button className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50" disabled>
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-semibold">1</button>
                            <button className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100">2</button>
                            <button className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookingLogsPage;
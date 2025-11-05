import React, { useState, useEffect, JSX } from 'react';
import { Search, ChevronDown, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, DollarSign, Loader2 } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { IAdminBookingsResponse, IBookingLog } from '../../util/interface/IBooking';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { useDebounce } from '../../hooks/useDebounce';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusStyles: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
        Paid: { bg: 'bg-green-100', text: 'text-green-800', icon: <DollarSign className="w-4 h-4" /> },
        Unpaid: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
        Refunded: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <DollarSign className="w-4 h-4" /> },
        Completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
        Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
        Canceled: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
        Cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
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

const FilterDropdown: React.FC<{ 
    label: string; 
    options: string[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, options, value, onChange }) => (
    <div className="relative">
        <select value={value} onChange={onChange} className="appearance-none w-full bg-white border border-slate-300 rounded-lg py-2 pl-4 pr-10 text-slate-700 leading-tight focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            <option value="All">{label}</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
            <ChevronDown className="w-4 h-4" />
        </div>
    </div>
);


const BookingLogsPage: React.FC = () => {
    const [bookings, setBookings] = useState<IBookingLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [filters, setFilters] = useState({
        bookingStatus: 'All',
        dateRange: 'All',
        serviceType: 'All',
        search: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);

    const debouncedSearch = useDebounce(filters.search, 500);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                const response: IAdminBookingsResponse = await bookingService.getAllBookingsForAdmin({
                    page: currentPage,
                    limit: 10,
                    search: debouncedSearch,
                    bookingStatus: filters.bookingStatus,
                });
                setBookings(response.bookings);
                setTotalPages(response.totalPages);
                setTotalBookings(response.totalBookings);
            } catch (err) {
                setError("Failed to fetch bookings.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [currentPage, debouncedSearch, filters.bookingStatus]);

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
                    <p className="text-slate-600 mt-1">Manage all bookings made on the platform.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative md:col-span-2 lg:col-span-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by user or provider..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <FilterDropdown 
                                label="Booking Status"
                                options={['Pending', 'In-Progress', 'Completed', 'Cancelled']}
                                value={filters.bookingStatus}
                                onChange={(e) => handleFilterChange('bookingStatus', e.target.value)}
                            />
                            <FilterDropdown label="Date Range" options={['Last 7 Days', 'Last 30 Days']} value={filters.dateRange} onChange={(e) => handleFilterChange('dateRange', e.target.value)} />
                            <FilterDropdown label="Service Type" options={['IT Support', 'Plumbing']} value={filters.serviceType} onChange={(e) => handleFilterChange('serviceType', e.target.value)} />
                        </div>
                    </div>

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
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center p-8"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" /></td></tr>
                                ) : bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-medium text-slate-700">{booking.id}</td>
                                            <td className="p-4"><div className="flex items-center gap-3"><img src={getCloudinaryUrl(booking.userAvatar)} alt={booking.userName} className="w-9 h-9 rounded-full"/><span>{booking.userName}</span></div></td>
                                            <td className="p-4">{booking.providerName}</td>
                                            <td className="p-4">{booking.serviceType}</td>
                                            <td className="p-4">{booking.dateTime}</td>
                                            <td className="p-4 text-center"><StatusBadge status={booking.paymentStatus} /></td>
                                            <td className="p-4 text-center"><StatusBadge status={booking.bookingStatus} /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={7} className="text-center p-8 text-slate-500">No bookings found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center p-4 border-t border-slate-200">
                        <span className="text-sm text-slate-600">Showing {bookings.length} of {totalBookings} results</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1} className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-semibold">{`Page ${currentPage} of ${totalPages}`}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
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
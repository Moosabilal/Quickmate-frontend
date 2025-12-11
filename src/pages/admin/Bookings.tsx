import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { IAdminBookingsResponse, IBookingLog } from '../../util/interface/IBooking';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { useDebounce } from '../../hooks/useDebounce';
import { StatusBadge } from '../../components/admin/BookingStatusBadge';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/admin/Pagination'; 
import { BookingTableRowSkeleton } from '../../components/admin/BookingTableRowSkeleton';
import { FilterDropdown } from '../../components/admin/BookingsFilterDropdown';

const BOOKING_PER_PAGE = 10;

const BookingLogsPage: React.FC = () => {
    const [bookings, setBookings] = useState<IBookingLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [filters, setFilters] = useState({
        bookingStatus: 'All',
        dateRange: 'All',
        search: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);

    const navigate = useNavigate();
    const debouncedSearch = useDebounce(filters.search, 500);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                const response: IAdminBookingsResponse = await bookingService.getAllBookingsForAdmin({
                    page: currentPage,
                    limit: BOOKING_PER_PAGE,
                    search: debouncedSearch,
                    bookingStatus: filters.bookingStatus,
                    dateRange: filters.dateRange,
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
    }, [currentPage, debouncedSearch, filters.bookingStatus, filters.dateRange]);

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-700 transition-colors">
                <div className="text-center p-8">
                    <p className="text-red-500 dark:text-red-400 text-lg font-medium">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-700 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Bookings</h1>
                    <p className="text-slate-500 dark:text-slate-300 mt-1">Manage all bookings made on the platform.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 transition-colors">
                    
                    <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow md:max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by user or provider..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-gray-600 rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <FilterDropdown 
                                    label="Booking Status"
                                    options={['Pending', 'In-Progress', 'Completed', 'Cancelled']}
                                    value={filters.bookingStatus}
                                    onChange={(e) => handleFilterChange('bookingStatus', e.target.value)}
                                />
                                <FilterDropdown 
                                    label="Date Range" 
                                    options={['Last 7 Days', 'Last 30 Days']} 
                                    value={filters.dateRange} 
                                    onChange={(e) => handleFilterChange('dateRange', e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase bg-slate-50 dark:bg-gray-700/50 border-b border-slate-100 dark:border-gray-700">
                                <tr>
                                    <th className="p-4 whitespace-nowrap">Booking ID</th>
                                    <th className="p-4 whitespace-nowrap">User</th>
                                    <th className="p-4 whitespace-nowrap">Provider</th>
                                    <th className="p-4 whitespace-nowrap">Service</th>
                                    <th className="p-4 whitespace-nowrap">Scheduled Date</th>
                                    <th className="p-4 text-center whitespace-nowrap">Payment</th>
                                    <th className="p-4 text-center whitespace-nowrap">Status</th>
                                    <th className="p-4 text-center whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                                {loading ? (
                                    [...Array(BOOKING_PER_PAGE)].map((_, i) => <BookingTableRowSkeleton key={i} />)
                                ) : bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="p-4 font-medium text-slate-700 dark:text-gray-200 text-sm">
                                                <span className="font-mono text-xs bg-slate-100 dark:bg-gray-700 px-2 py-1 rounded">{booking.id.slice(-6).toUpperCase()}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={booking.userAvatar ? getCloudinaryUrl(booking.userAvatar) : '/profileImage.png'} 
                                                        alt={booking.userName} 
                                                        className="w-8 h-8 rounded-full object-cover bg-slate-200 dark:bg-gray-600"
                                                    />
                                                    {/* Removed 'truncate' and 'max-w' to allow full name display */}
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                                        {booking.userName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-gray-300 whitespace-nowrap">
                                                {booking.providerName}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-gray-300 whitespace-nowrap">
                                                {booking.serviceType}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-gray-300 whitespace-nowrap">{new Date(booking.dateTime).toLocaleDateString()}</td>
                                            <td className="p-4 text-center">
                                                <StatusBadge status={booking.paymentStatus} />
                                            </td>
                                            <td className="p-4 text-center">
                                                <StatusBadge status={booking.bookingStatus} />
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors group"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center p-12">
                                            <div className="flex flex-col items-center justify-center text-slate-500 dark:text-gray-400">
                                                <Search className="w-10 h-10 mb-3 opacity-20" />
                                                <p className="text-lg font-medium">No bookings found</p>
                                                <p className="text-sm">Try adjusting your filters or search criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-slate-50 dark:bg-gray-700/30 border-t border-slate-200 dark:border-gray-700 rounded-b-2xl">
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            total={totalBookings} 
                            limit={BOOKING_PER_PAGE} 
                            onPageChange={setCurrentPage} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingLogsPage;
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Search, Eye, X } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { BookingStatus, IBookingHistoryPage, IBookingStatusCounts } from '../../util/interface/IBooking';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { getStatusColor } from '../../components/getStatusColor';
import { getStatusIcon } from '../../components/BookingStatusIcon';

const BookingHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BookingStatus>(BookingStatus.All);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<IBookingHistoryPage[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [tabCounts, setTabCounts] = useState<IBookingStatusCounts>({
    [BookingStatus.All]: 0,
    [BookingStatus.PENDING]: 0,
    [BookingStatus.CONFIRMED]: 0,
    [BookingStatus.IN_PROGRESS]: 0,
    [BookingStatus.COMPLETED]: 0,
    [BookingStatus.CANCELLED]: 0,
    [BookingStatus.EXPIRED]: 0,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const navigate = useNavigate()

  useEffect(() => {
    const getBookingHistory = async () => {
      setIsLoading(true);
      try {
        const status = activeTab === BookingStatus.All ? BookingStatus.All : activeTab
        const response = await bookingService.getAllBookings(
          debouncedSearchTerm,
          status || ''
        );

        console.log('the response is', response.data);

        setBookings(response.data);
        setTabCounts(response.counts);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getBookingHistory();
  }, [currentPage, debouncedSearchTerm, activeTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTabClick = (tab: BookingStatus) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const tabs = [
    { id: BookingStatus.All, label: 'All Bookings', count: tabCounts[BookingStatus.All] },
    { id: BookingStatus.PENDING, label: 'Pending', count: tabCounts[BookingStatus.PENDING] },
    { id: BookingStatus.IN_PROGRESS, label: 'In Progress', count: tabCounts[BookingStatus.IN_PROGRESS] },
    { id: BookingStatus.CONFIRMED, label: 'Upcoming', count: tabCounts[BookingStatus.CONFIRMED] },
    { id: BookingStatus.COMPLETED, label: 'Completed', count: tabCounts[BookingStatus.COMPLETED] },
    { id: BookingStatus.CANCELLED, label: 'Canceled', count: tabCounts[BookingStatus.CANCELLED] },
    { id: BookingStatus.EXPIRED, label: 'Expired', count: tabCounts[BookingStatus.EXPIRED] } 

  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 font-sans transition-colors duration-300">

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Booking History</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage all your service appointments</p>
            </div>

            <div className="relative w-full md:w-72 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  type='button'
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Clear Search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 -mb-px overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 min-w-max border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    group inline-flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {tab.label}
                  <span className={`
                    inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }
                  `}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">Loading your bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 lg:items-center">

                    <div className="flex-shrink-0 relative">
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceName}
                        className="w-full h-48 lg:w-24 lg:h-24 rounded-xl object-cover shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                              {booking.serviceName}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}
                            </span>
                          </div>
                          {booking.createdAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                              Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          )}
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Total Amount</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{booking.price}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">

                        <div className="flex items-center gap-3">
                          <img
                            src={booking.providerImage}
                            alt={booking.providerName}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 uppercase font-semibold">Provider</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{booking.providerName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 uppercase font-semibold">Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                              {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 uppercase font-semibold">Time</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                              {booking.time} <span className="text-xs text-gray-500">({booking.priceUnit === "PerHour" ? booking.duration : booking.priceUnit})</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:col-span-2 lg:col-span-1">
                          <button
                            type='button'
                            onClick={() => navigate(`/profile/booking-history/bookingDetails/${booking.id}`)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm hover:shadow group-hover:scale-[1.02]"
                          >
                            View Details
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
              <Search className="w-10 h-10 text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Bookings Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
              We couldn't find any bookings matching your criteria. Try adjusting your filters or search term.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setActiveTab(BookingStatus.All); }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingHistory;
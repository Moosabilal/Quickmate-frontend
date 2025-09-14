import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Star, Filter, Search, Eye, Download, MoreHorizontal, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { BookingStatus, IBookingHistoryPage } from '../../interface/IBooking';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { useNavigate } from 'react-router-dom';

const BookingHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BookingStatus>(BookingStatus.All);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState<IBookingHistoryPage[]>([])

  const navigate = useNavigate()

  useEffect(() => {
    const getBooking = async () => {
      const response = await bookingService.getallBookings()
      setBookings(response)
    }
    getBooking()
  }, [])

  const tabs = [
    { id: BookingStatus.All, label: 'All Bookings', count: bookings.length },
    { id: BookingStatus.PENDING, label: 'Pending', count: bookings.filter(b => b.status === BookingStatus.PENDING).length },
    { id: BookingStatus.COMPLETED, label: 'Completed', count: bookings.filter(b => b.status === BookingStatus.COMPLETED).length },
    { id: BookingStatus.IN_PROGRESS, label: 'In Progress', count: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length },
    { id: BookingStatus.CONFIRMED, label: 'Upcoming', count: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length },
    { id: BookingStatus.CANCELLED, label: 'Canceled', count: bookings.filter(b => b.status === BookingStatus.CANCELLED).length }
  ];

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case BookingStatus.CONFIRMED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      case BookingStatus.IN_PROGRESS:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case BookingStatus.CONFIRMED:
        return <Clock className="w-4 h-4" />;
      case BookingStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      case BookingStatus.IN_PROGRESS:
        return <PlayCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesTab = activeTab === BookingStatus.All || booking.status === activeTab;
    const matchesSearch = booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking History</h1>
              <p className="text-gray-600">View and manage all your service bookings</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              {/* <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <Filter className="w-5 h-5" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                <Download className="w-5 h-5" />
                Export
              </button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={getCloudinaryUrl(booking.serviceImage)}
                        alt={booking.serviceName}
                        className="w-20 h-20 rounded-2xl object-cover shadow-md"
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">{booking.serviceName}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            {booking.createdAt && <span className={`px-3 py-1 rounded-full text-sm font-medium border bg-gray-50 text-gray-800 border-gray-200 `}>
                              {`Booked on ${new Date(booking.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                            </span>}

                          </div>

                          <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                              <img
                                src={getCloudinaryUrl(booking.providerImage)}
                                alt={booking.providerName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="font-medium">{booking.providerName}</span>
                            </div>
                            {/* <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{booking.rating}</span>
                            </div> */}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{booking.time} ({booking.priceUnit == "PerHour" ? booking.duration : booking.priceUnit})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-end gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">₹{booking.price}</div>
                            <div className="text-sm text-gray-500">Total Amount</div>
                          </div>

                          <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                              onClick={() => navigate(`/profile/booking-history/bookingDetails/${booking.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            {/* <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                              <MoreHorizontal className="w-5 h-5 text-gray-500" />
                            </button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* {booking.status === 'Confirmed' && (
                  <div className="px-6 pb-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700 font-medium">Booking Confirmed</span>
                        <span className="text-blue-600">{new Date(booking.date) > new Date() ? 'Confirmed' : 'Today'}</span>
                      </div>
                      <div className="mt-2 bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">You haven't made any bookings yet or no results match your search.</p>
              <button
                onClick={() => navigate('/services')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                Browse Services
              </button>
            </div>
          )}
        </div>

        {/* {filteredBookings.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl transition-colors shadow-sm">
              Load More Bookings
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default BookingHistory;
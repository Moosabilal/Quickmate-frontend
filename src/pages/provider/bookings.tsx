import React, { useState, useEffect } from 'react';
import {
  Calendar, MapPin, CheckCircle, AlertTriangle, User,
  Search, Eye, IndianRupee, X, Loader2
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { bookingService } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import { BookingStatus, IBookingStatusCounts } from '../../util/interface/IBooking';
import DeleteConfirmationModal from '../../components/deleteConfirmationModel';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { toast } from 'react-toastify';
import { IProviderBookingManagement } from '../../util/interface/IBooking';
import { useDebounce } from '../../hooks/useDebounce';
import { getStatusColor } from '../../components/getStatusColor';
import { getStatusIcon } from '../../components/BookingStatusIcon';
import { isAxiosError } from 'axios';
import { ProviderStatus } from '../../util/interface/IProvider';

const ProviderBookingManagementPage: React.FC = () => {
  const [bookings, setBookings] = useState<IProviderBookingManagement[]>([]);
  const [activeTab, setActiveTab] = useState<string>(BookingStatus.PENDING);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<IProviderBookingManagement | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [providerEarnings, setProviderEarnings] = useState(0);

  const { provider } = useAppSelector((state) => state.provider);
  const { user } = useAppSelector((state) => state.auth)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const navigate = useNavigate()

  const [tabCounts, setTabCounts] = useState<IBookingStatusCounts>({
    [BookingStatus.All]: 0,
    [BookingStatus.PENDING]: 0,
    [BookingStatus.CONFIRMED]: 0,
    [BookingStatus.IN_PROGRESS]: 0,
    [BookingStatus.COMPLETED]: 0,
    [BookingStatus.CANCELLED]: 0,
    [BookingStatus.EXPIRED]: 0,
  });

  const tabs = [
    { key: BookingStatus.PENDING, label: 'New Requests', count: tabCounts[BookingStatus.PENDING] },
    { key: BookingStatus.CONFIRMED, label: 'Upcoming', count: tabCounts[BookingStatus.CONFIRMED] },
    { key: BookingStatus.IN_PROGRESS, label: 'In Progress', count: tabCounts[BookingStatus.IN_PROGRESS] },
    { key: BookingStatus.COMPLETED, label: 'Completed', count: tabCounts[BookingStatus.COMPLETED] },
    { key: BookingStatus.CANCELLED, label: 'Cancelled', count: tabCounts[BookingStatus.CANCELLED] },
    { key: BookingStatus.EXPIRED, label: 'Expired', count: tabCounts[BookingStatus.EXPIRED] },
  ];

  useEffect(() => {
    if (!provider?.id) return;
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await bookingService.getBookingFor_Prov_mngmnt(
          provider.id as string,
          debouncedSearch,
          activeTab
        );
        console.log('Fetched bookings:', response.bookings);
        setBookings(response.bookings)
        setProviderEarnings(response.earnings);
        setTabCounts(response.counts);
      } catch (error) {
        let errorMessage = 'Oops, something went wrong while fetching bookings.';
        if (isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
      } finally {
        setLoading(false)
      }
    };

    fetchBookings();
  }, [provider.id, debouncedSearch, activeTab]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (provider.status !== ProviderStatus.Active) {
      if (provider.status === ProviderStatus.Pending) {
        toast.info("Please wait for admin approval before managing jobs.");
      } else if (provider.status === ProviderStatus.Suspended) {
        toast.error("Your account is suspended. Please contact admin to resolve this.");
      } else if (provider.status === ProviderStatus.InActive) {
        toast.error("Your account has been rejected. Please contact admin.");
      } else {
        toast.error("Your account is not active. Action denied.");
      }
      return;
    }

    const currentBooking = bookings.find(b => b.id === bookingId);

    if (newStatus === BookingStatus.IN_PROGRESS && currentBooking) {

      const dateTimeString = `${currentBooking.date} ${currentBooking.time}`;
      const scheduledTime = new Date(dateTimeString);
      const now = new Date();

      if (isNaN(scheduledTime.getTime())) {
        toast.error("Invalid booking date format. Cannot start job.");
        return;
      }

      const diffInMinutes = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);

      if (diffInMinutes > 5) {
        toast.warning(`You can only start the job 5 minutes before the scheduled time (${currentBooking.time}).`);
        return;
      }
    }

    try {

      setProcessingId(bookingId);

      const response = await bookingService.updateBookingStatus(bookingId, newStatus as BookingStatus);

      if (activeTab !== BookingStatus.All) {
        setBookings(prev => prev.filter(b => b.id !== bookingId));

        setTabCounts(prev => ({
          ...prev,
          [activeTab]: Math.max(0, prev[activeTab as BookingStatus] - 1),
          [newStatus]: (prev[newStatus as BookingStatus] || 0) + 1
        }));
      } else {
        setBookings(prev => prev.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus as BookingStatus } : booking
        ));
      }

      if (newStatus === BookingStatus.COMPLETED) {
        toast.info(response)
      } else {
        toast.success(response)
      }
      setShowDetails(false);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompletion = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await bookingService.updateBookingStatus(bookingId, BookingStatus.COMPLETED);
      navigate('/verify-otp', { state: { email: user?.email, bookingId, newStatus: BookingStatus.COMPLETED } })
    } catch (error) {
      console.error('Error marking completion:', error);
      toast.error("Failed to mark completion");
      setProcessingId(null);
    }
  }

  const handleConfirm = async () => {
    if (!selectedBooking) return;
    setIsDeleting(true);
    try {
      await bookingService.updateBookingStatus(selectedBooking.id, BookingStatus.CANCELLED);
      setBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
      setTabCounts(prev => ({
        ...prev,
        [activeTab]: Math.max(0, prev[activeTab as BookingStatus] - 1),
        [BookingStatus.CANCELLED]: (prev[BookingStatus.CANCELLED] || 0) + 1
      }));
      toast.success("Booking cancelled successfully");
    } catch (err) {
      console.log('Failed to cancel booking', err);
      toast.error("Failed to cancel booking");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setShowDetails(false);
    }
  }


  const handleCancelBooking = (booking: IProviderBookingManagement) => {
    setSelectedBooking(booking);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">

          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 mb-6 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    Booking Management
                  </h1>
                  <p className="text-slate-500 dark:text-gray-400 text-sm">
                    Manage your upcoming and past jobs
                  </p>
                </div>
                <div className="flex items-center self-start sm:self-center">
                  <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1 text-lg">
                      <IndianRupee className="h-4 w-4" />
                      {providerEarnings}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500 font-medium uppercase tracking-wide">Total Earnings</div>
                  </div>
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search bookings by customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              <div className="flex overflow-x-auto pb-2 sm:pb-0 space-x-2 bg-slate-50 dark:bg-gray-700/50 p-1.5 rounded-xl border border-slate-100 dark:border-gray-700 no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${activeTab === tab.key
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-gray-600'
                      : 'text-slate-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-600 hover:text-slate-900 dark:hover:text-gray-200'
                      }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs font-bold ${activeTab === tab.key
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                        : 'bg-slate-200 dark:bg-gray-600 text-slate-600 dark:text-gray-300'
                        }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 animate-pulse border border-slate-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-slate-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-slate-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-slate-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-slate-300 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  No Bookings Found
                </h3>
                <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
                  {searchTerm ? 'Try adjusting your search terms to find what you are looking for.' : `You don't have any ${activeTab.toLowerCase().replace('_', ' ')} bookings at the moment.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-gray-700 group">
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                        <div className="flex items-start space-x-4 w-full">
                          <div className="relative flex-shrink-0">
                            <img
                              src={booking.customerImage ? booking.customerImage : '/profileImage.png'}
                              alt={booking.customerName}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white dark:border-gray-700 shadow-sm object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                {booking.customerName}
                              </h3>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                <span className="capitalize">{booking.status.replace('-', ' ').toLowerCase()}</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                                <span>{formatDate(booking.date)} <span className="text-slate-300 dark:text-gray-600">|</span> {booking.time}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                                <span className="truncate max-w-[200px]" title={booking.location}>{booking.location}</span>
                              </div>
                              <div className="flex items-center space-x-2 sm:col-span-2">
                                <IndianRupee className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                                <span className="font-semibold text-slate-900 dark:text-white">{booking.payment}</span>
                                {/* <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ml-2 ${booking.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                  {booking.paymentStatus}
                                </span> */}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden sm:block">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetails(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 bg-slate-50 dark:bg-gray-700/30 p-3 rounded-xl border border-slate-100 dark:border-gray-700/50">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{booking.service}</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1">
                          {booking.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-gray-700 gap-4">
                        <div className="text-xs text-slate-400 dark:text-gray-500 font-medium">
                          Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetails(true);
                            }}
                            className="sm:hidden flex-1 px-4 py-2 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700"
                          >
                            View Details
                          </button>

                          {booking.status === BookingStatus.PENDING && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                                disabled={processingId === booking.id}
                                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center"
                              >
                                {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept"}
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking)}
                                disabled={processingId === booking.id}
                                className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-gray-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium rounded-lg transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {booking.status === BookingStatus.CONFIRMED && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(booking.id, BookingStatus.IN_PROGRESS)}
                                disabled={processingId === booking.id}
                                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center"
                              >
                                {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Job"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelBooking(booking)}
                                disabled={processingId === booking.id}
                                className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-gray-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === BookingStatus.IN_PROGRESS && (
                            <button
                              type="button"
                              onClick={() => handleCompletion(booking.id)}
                              disabled={processingId === booking.id}
                              className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                              {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Mark Complete</>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-200">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Booking Details</h2>
              <button
                type='button'
                aria-label='close'
                onClick={() => setShowDetails(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedBooking.customerImage ? selectedBooking.customerImage : '/profileImage.png'}
                  alt={selectedBooking.customerName}
                  className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-gray-600"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedBooking.customerName}
                  </h3>
                  <div className="flex flex-col text-sm text-slate-500 dark:text-gray-400 mt-0.5">
                    <span>{selectedBooking.customerEmail}</span>
                    <span>{selectedBooking.customerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-gray-700/30 rounded-xl p-4 border border-slate-100 dark:border-gray-700/50">
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Service</label>
                    <p className="text-slate-900 dark:text-white font-medium text-sm mt-0.5">{selectedBooking.service}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Date & Time</label>
                    <p className="text-slate-900 dark:text-white font-medium text-sm mt-0.5">{formatDate(selectedBooking.date)}<br />{selectedBooking.time}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Amount</label>
                    <p className="flex items-center text-slate-900 dark:text-white font-bold text-sm mt-0.5">
                      <IndianRupee className="h-3.5 w-3.5 mr-0.5" />{selectedBooking.payment}
                    </p>
                  </div>
                  <div>
                    {/* <label className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Payment</label>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${selectedBooking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {selectedBooking.paymentStatus}
                    </span> */}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Location</label>
                  <div className="flex items-start mt-1 gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-gray-500 mt-0.5 shrink-0" />
                    <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed">{selectedBooking.location}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Description</label>
                  <p className="text-slate-700 dark:text-gray-300 text-sm mt-1 leading-relaxed bg-white dark:bg-gray-800 p-3 border border-slate-100 dark:border-gray-700 rounded-lg">
                    {selectedBooking.description}
                  </p>
                </div>

                {selectedBooking.specialRequests && (
                  <div>
                    <label className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Special Requests</label>
                    <div className="flex items-start gap-2 mt-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">{selectedBooking.specialRequests}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {selectedBooking.status === BookingStatus.PENDING && (
                  <div className="flex gap-3">
                    <button onClick={() => handleStatusUpdate(selectedBooking.id, BookingStatus.CONFIRMED)} disabled={!!processingId} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center">
                      {processingId === selectedBooking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept"}
                    </button>
                    <button onClick={() => handleStatusUpdate(selectedBooking.id, BookingStatus.CANCELLED)} disabled={!!processingId} className="flex-1 py-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Decline</button>
                  </div>
                )}
                {selectedBooking.status === BookingStatus.CONFIRMED && (
                  <div className="flex gap-3">
                    <button onClick={() => handleStatusUpdate(selectedBooking.id, BookingStatus.IN_PROGRESS)} disabled={!!processingId} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                      {processingId === selectedBooking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Job"}
                    </button>
                    <button onClick={() => handleCancelBooking(selectedBooking)} disabled={!!processingId} className="flex-1 py-2.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Cancel</button>
                  </div>
                )}
                {selectedBooking.status === BookingStatus.IN_PROGRESS && (
                  <button onClick={() => handleCompletion(selectedBooking.id)} disabled={!!processingId} className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                    {processingId === selectedBooking.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Mark Job Complete</>}
                  </button>
                )}
                {['Completed', 'Cancelled'].includes(selectedBooking.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())) && (
                  <div className="text-center py-2 text-sm text-slate-400 dark:text-gray-500 italic">No further actions available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedBooking && <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirm}
        itemType={DeleteConfirmationTypes.BOOKING}
        itemName={selectedBooking.service || ''}
        itemDetails={`Booking ID: #${selectedBooking.id.slice(-8).toUpperCase()}\nCustomer: ${selectedBooking.customerName}`}
        isLoading={isDeleting}
        customMessage="Are you sure you want to cancel this booking? This may impact your reliability score."
        additionalInfo="If you cancel now, you may miss out on this service."
      />}
    </div>
  );
};

export default ProviderBookingManagementPage;
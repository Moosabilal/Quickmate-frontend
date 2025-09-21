import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Star,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  Book,
  IndianRupee
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { bookingService } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import { BookingStatus } from '../../util/interface/IBooking';
import DeleteConfirmationModal from '../../components/deleteConfirmationModel';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { toast } from 'react-toastify';
import { IProviderBookingManagement } from '../../util/interface/IBooking';

const ProviderBookingManagementPage: React.FC = () => {
  const [bookings, setBookings] = useState<IProviderBookingManagement[]>([]);
  const [activeTab, setActiveTab] = useState<string>(BookingStatus.PENDING);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<IProviderBookingManagement | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { provider } = useAppSelector((state) => state.provider);
  const { user } = useAppSelector((state) => state.auth)

  const navigate = useNavigate()

  const tabs = [
    { key: BookingStatus.PENDING, label: 'New Requests', count: bookings.filter(b => b.status === BookingStatus.PENDING).length },
    { key: BookingStatus.CONFIRMED, label: 'Upcoming Jobs', count: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length },
    { key: BookingStatus.IN_PROGRESS, label: 'In Progress', count: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length },
    { key: BookingStatus.COMPLETED, label: 'Completed', count: bookings.filter(b => b.status === BookingStatus.COMPLETED).length },
    { key: BookingStatus.CANCELLED, label: 'Cancelled', count: bookings.filter(b => b.status === BookingStatus.CANCELLED).length }
  ];

  useEffect(() => {
    if (!provider?.id) return;
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await bookingService.getBookingFor_Prov_mngmnt(provider.id as string)
        setBookings(response)
      } catch (error: any) {
        toast.error(error.message || 'Oops something went wrong')
      } finally {
        setLoading(false)
      }
    };

    fetchBookings();
  }, [provider?.id]);

  const filteredBookings = bookings.filter(booking => {
    const matchesTab = booking.status === activeTab;
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case BookingStatus.CONFIRMED:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case BookingStatus.IN_PROGRESS:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <AlertTriangle className="w-4 h-4" />;
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

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      setLoading(true)
      const response = await bookingService.updateBookingStatus(bookingId, newStatus as BookingStatus);
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus as BookingStatus } : booking
      ));
      if (newStatus === BookingStatus.COMPLETED) {
        toast.info(response)
      } else {
        toast.success(response)
      }
      setShowDetails(false);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status. Please try again.');
      return;

    } finally {
      setLoading(false)
    }

  };

  const handleCompletion = async (bookingId: string) => {
    await handleStatusUpdate(bookingId, BookingStatus.COMPLETED)
    navigate('/verify-otp', { state: { email: user?.email, bookingId, newStatus: BookingStatus.COMPLETED } })
  }

  const handleConfirm = async () => {
    if (!selectedBooking) return;
    setIsDeleting(true);
    await handleStatusUpdate(selectedBooking.id, BookingStatus.CANCELLED);
    setIsDeleting(false);
    setShowDeleteModal(false)
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
    <>
      <main className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">

            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Booking Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      Manage your upcoming and past jobs
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl">
                      <div className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {bookings.filter(b => b.status === BookingStatus.COMPLETED).reduce((sum, b) => sum + b.payment, 0)}
                      </div>

                      <div className="text-xs text-green-500">Total Earnings</div>
                    </div>
                  </div>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings by customer, service, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === tab.key
                        ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'
                        }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
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
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Bookings Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchTerm ? 'Try adjusting your search terms.' : `No ${activeTab} bookings at the moment.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="relative">
                              <img
                                src={getCloudinaryUrl(booking.customerImage)}
                                alt={booking.customerName}
                                className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {booking.customerName}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                                  {getStatusIcon(booking.status)}
                                  <span className="capitalize">{booking.status.replace('-', ' ')}</span>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(booking.date)} at {booking.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{booking.duration}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">{booking.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <IndianRupee className="w-3 h-3" />
                                  {booking.payment}
                                  <span className={`px-2 py-1 rounded text-xs ${booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {booking.paymentStatus}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{booking.service}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                  {booking.description}
                                </p>
                              </div>

                              {/* {booking.rating && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium">{booking.rating}</span>
                                  </div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Customer Rating</span>
                                </div>
                              )} */}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetails(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {(booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.CANCELLED) &&
                              // <><button
                              //   onClick={() => window.open(`tel:${booking.customerPhone}`)}
                              //   className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-300"
                              //   title="Call Customer"
                              // >
                              //   <Phone className="w-5 h-5" />
                              // </button>
                              <button
                                onClick={() => {
                                  console.log('the joininng id', `${booking.customerId}-${provider.id}`)

                                  navigate('/provider/providerBookingManagement/providerLiveChat', { state: { bookingId: booking.id, name: booking.customerName, joiningId: `${booking.customerId}-${provider.id}` } })
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-300"
                                title="Message Customer"
                              >
                                <MessageCircle className="w-5 h-5"
                                />
                              </button>
                              // </>
                            }
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-600">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Booked on {new Date(booking.createdAt).toLocaleDateString()}
                          </div>

                          <div className="flex items-center space-x-3">
                            {booking.status === BookingStatus.PENDING && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-300"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking)}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-300"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {booking.status === BookingStatus.CONFIRMED && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, BookingStatus.IN_PROGRESS)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300"
                                >
                                  Start Job
                                </button>
                                <button
                                  onClick={() => () => handleCancelBooking(booking)}
                                  className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium rounded-lg transition-all duration-300"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === BookingStatus.IN_PROGRESS && (
                              <button
                                onClick={() => handleCompletion(booking.id)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-300"
                              >
                                Mark Complete
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <img
                      src={getCloudinaryUrl(selectedBooking.customerImage)}
                      alt={selectedBooking.customerName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedBooking.customerName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selectedBooking.customerEmail}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selectedBooking.customerPhone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</label>
                        <p className="text-gray-900 dark:text-white font-medium">{selectedBooking.service}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(selectedBooking.date)} at {selectedBooking.time}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.duration}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment</label>
                        <p className="flex items-center text-gray-900 dark:text-white font-medium">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {selectedBooking.payment} ({selectedBooking.paymentStatus})
                        </p>

                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                          {selectedBooking.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      {/* {selectedBooking.rating && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</label>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-gray-900 dark:text-white font-medium">{selectedBooking.rating}</span>
                          </div>
                        </div>
                      )} */}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                    <p className="text-gray-900 dark:text-white">{selectedBooking.location}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                    <p className="text-gray-900 dark:text-white">{selectedBooking.description}</p>
                  </div>

                  {selectedBooking.specialRequests && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Special Requests</label>
                      <p className="text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        {selectedBooking.specialRequests}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    {selectedBooking.status === BookingStatus.PENDING && (
                      <>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedBooking.id, BookingStatus.CONFIRMED);
                            setShowDetails(false);
                          }}
                          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-300"
                        >
                          Accept Booking
                        </button>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedBooking.id, BookingStatus.CANCELLED);
                            setShowDetails(false);
                          }}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-300"
                        >
                          Decline Booking
                        </button>
                      </>
                    )}
                    {selectedBooking.status === BookingStatus.CONFIRMED && (
                      <>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedBooking.id, BookingStatus.IN_PROGRESS);
                            setShowDetails(false);
                          }}
                          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-300"
                        >
                          Start Job
                        </button>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedBooking.id, BookingStatus.CANCELLED);
                            setShowDetails(false);
                          }}
                          className="flex-1 px-4 py-3 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-xl transition-all duration-300"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}
                    {selectedBooking.status === BookingStatus.IN_PROGRESS && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedBooking.id, BookingStatus.COMPLETED);
                          setShowDetails(false);
                        }}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-300"
                      >
                        Mark as Completed
                      </button>
                    )}
                    {selectedBooking.status === 'Completed' && (
                      <div className="w-full text-center py-3 text-gray-600 dark:text-gray-300">
                        This job has been completed
                      </div>
                    )}
                    {selectedBooking.status === BookingStatus.CANCELLED && (
                      <div className="w-full text-center py-3 text-red-600 dark:text-red-400">
                        This booking was cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      {showDeleteModal && selectedBooking && <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirm}
        itemType={DeleteConfirmationTypes.BOOKING}
        itemName={selectedBooking.service || ''}
        itemDetails={`Booking ID: #${selectedBooking.id.slice(-8).toUpperCase()}\nCustomer: ${selectedBooking.customerName}` || ''}
        isLoading={isDeleting}
        customMessage="Are you sure you want to cancel this booking? This may impact your reliability score."
        additionalInfo="If you cancel now, you may miss out on this service."
      />}
    </>
  );
};

export default ProviderBookingManagementPage;
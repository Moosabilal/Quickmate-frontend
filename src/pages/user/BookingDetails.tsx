import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  CreditCard,
  FileText,
  MapIcon,
  Shield,
  Award
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { BookingStatus, IBookingConfirmationPage } from '../../interface/IBooking';
import { getCloudinaryUrl } from '../../util/cloudinary';
import ProviderDeleteConfirmationModal from '../../components/provider/deleteConfirmationModel';
import { toast } from 'react-toastify';

const BookingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<IBookingConfirmationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<IBookingConfirmationPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);




  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await bookingService.getBookingById(id!);
        setBooking(response);
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const handleDeleteClick = (booking: IBookingConfirmationPage) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;

    setIsDeleting(true);
    try {
      const { message } = await bookingService.cancelBooking(bookingToDelete.id);
      console.log('the delete response', message);
      toast.info(message);
      setBooking((prev) => prev ? { ...prev, status: BookingStatus.CANCELLED } : prev);
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (error: any) {
      console.log('error in deleting');
      toast.error(error.response?.data?.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  console.log('The booking details we have', booking)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'Confirmed':
        return <AlertCircle className="w-5 h-5" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
          <button
            onClick={() => navigate('/profile/booking-history')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Back to Booking History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile/booking-history')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                <p className="text-gray-600">Booking ID: #{booking.bookedOrderId.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            {/* <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={getCloudinaryUrl(booking.serviceImage!)}
                      alt={booking.serviceName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white/20"
                    />
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{booking.serviceName}</h2>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className="font-medium">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">₹{booking.amount}</div>
                    <div className="text-blue-100">Total Amount</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Time & Duration</div>
                      <div className="font-semibold text-gray-900">
                        {booking.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-semibold text-gray-900">{booking.address.city}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Service Provider</h3>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={getCloudinaryUrl(booking.providerImage!)}
                      alt={booking.providerName}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{booking.providerName}</h4>
                    <p className="text-gray-600">Professional Service Provider</p>
                    {/* <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-gray-700">4.8</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">125+ reviews</span>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 text-sm font-medium">Verified Pro</span>
                      </div>
                    </div> */}
                  </div>
                </div>
                {/* <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                </div> */}
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Service Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">service</label>
                    <p className="font-semibold text-gray-900">{booking.serviceName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Duration</label>
                    <p className="font-semibold text-gray-900">({booking.priceUnit === "PerHour" ? booking.duration : booking.priceUnit})</p>
                  </div>
                  {/* <div>
                    <label className="text-sm text-gray-500">Base Price</label>
                    <p className="font-semibold text-gray-900">₹{booking.amount}</p>
                  </div> */}
                  <div>
                    <label className="text-sm text-gray-500">special instruction</label>
                    <p className="font-semibold text-gray-900">₹{booking.amount}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* <div>
                    <label className="text-sm text-gray-500">Add-ons</label>
                    <p className="font-semibold text-gray-900">Fridge Cleaning - ₹200</p>
                  </div> */}
                  <div>
                    <label className="text-sm text-gray-500">Sub Total</label>
                    <p className="font-semibold text-gray-900">₹{booking.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Address</label>
                    <p className="font-semibold text-gray-900">{booking.address.label}</p>
                    <p>{booking.address.state}, {booking.address.city}</p>
                    <p>{booking.address.street}, {booking.address.zip}</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Special Instructions</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800">
                  {booking.specialInstruction || 'No special instructions provided.'}
                </p>
              </div>
            </div>


            {booking.status === 'Completed' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">After Service</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-800 mb-3">
                      ✓ Service completed successfully! The cleaned area and care instructions have been shared with you.
                    </p>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium">
                      Leave a Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Status</h3>
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <div>
                  <div className="font-semibold">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                  <div className="text-sm opacity-75">
                    {booking.status === 'Pending' && 'Your booking is pending confirmation'}
                    {booking.status === 'Confirmed' && 'Service provider will arrive soon'}
                    {booking.status === 'Completed' && 'Service completed successfully'}
                    {booking.status === 'Cancelled' && 'Booking was canceled'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service Cost</span>
                  <span className="font-semibold">₹{booking.amount}</span>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-semibold">₹0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-semibold">₹0</span>
                </div> */}
                <hr className="border-gray-200" />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Paid</span>
                  <span>₹{booking.amount}</span>
                </div>
                {/* <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Paid via Credit Card ****1234</span>
                </div> */}
              </div>
            </div>

            {booking.status === BookingStatus.PENDING && <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {/* <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Download Invoice</span>
                </button> */}
                {/* <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left">
                  <MapIcon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">View Location</span>
                </button> */}
                {/* {booking.status === BookingStatus.COMPLETED && (
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left">
                    <Star className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Rate & Review</span>
                  </button>
                )} */}
                {booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED && (
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-colors text-left text-red-600"
                    onClick={() => handleDeleteClick(booking)}
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Cancel Booking</span>
                  </button>
                )}
              </div>
            </div>}

            {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Contact Support</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Call Customer Care</span>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <ProviderDeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType='booking'
        itemName={bookingToDelete?.serviceName || ''}
        itemDetails={bookingToDelete ? `Booking ID: #${bookingToDelete.bookedOrderId.slice(-8).toUpperCase()}\n ${bookingToDelete.serviceName}  • $${bookingToDelete?.amount}` : ''}
        isLoading={isDeleting}
        customMessage="Are you sure you want to cancel this booking?."
        additionalInfo="If you cancel now, you may miss out on this service."
      />
    </div>
  );
};

export default BookingDetails;
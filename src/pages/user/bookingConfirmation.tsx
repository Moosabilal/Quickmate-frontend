import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, MapPin, Phone, User, CreditCard, Clock, FileText, Loader2 } from 'lucide-react';
import { BookingStatus, IBookingConfirmationPage } from '../../util/interface/IBooking';
import { bookingService } from '../../services/bookingService';
import { useNavigate, useParams } from 'react-router-dom';

const BookingConfirmation: React.FC = () => {
  const { bookingId } = useParams<{bookingId: string}>();
  
  const [booking, setBooking] = useState<IBookingConfirmationPage>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate()

  useEffect(() => {
    const getBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getBookingById(bookingId!);
        setBooking(response);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (bookingId) {
      getBookings();
    }
  }, [bookingId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status?.toLowerCase() === 'paid' 
      ? 'text-green-600 bg-green-50' 
      : 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">{error || 'Booking not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
            <div className="relative bg-white rounded-full p-3 shadow-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Thank you for choosing our service. Your booking has been successfully confirmed.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{booking.serviceName}</h2>
                    <p className="text-blue-100">Booking ID: #{booking.bookedOrderId.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Customer Name</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{booking.customer}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900">{booking.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Service Date</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(booking.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Time</p>
                        <p className="text-lg font-semibold text-gray-900">{booking.time}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Service Address</p>
                      <div className="text-gray-900">
                        <span className="font-semibold text-blue-600">{booking.address.label}</span>
                        <p className="text-lg">
                          {booking.address.street}, {booking.address.city}
                        </p>
                        <p className="text-gray-600">
                          {booking.address.state}, {booking.address.zip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.specialInstruction && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                        <FileText className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Special Instructions</p>
                        <p className="text-gray-900">{booking.specialInstruction}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="font-medium text-gray-700">Total Amount</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{booking.amount}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-700">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-700">Confirmation email sent to your inbox</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-700">Service provider will contact you 24 hours before</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-700">Track your booking in the dashboard</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => navigate('/profile/booking-history')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                View My Bookings
              </button>
              <button 
                onClick={() => navigate('/services')}
                className="w-full bg-white text-gray-700 py-4 px-6 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-200">
                Book Another Service
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">Our support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <a 
              href="mailto:hello@quickmaker.com" 
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@quickmaker.com
            </a>
            <a 
              href="tel:+1-555-123-4567" 
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              +1 (555) 123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
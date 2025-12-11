import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, MapPin, Phone, User, CreditCard, Clock, FileText, Loader2, ArrowRight } from 'lucide-react';
import { IBookingConfirmationPage } from '../../util/interface/IBooking';
import { bookingService } from '../../services/bookingService';
import { useNavigate, useParams } from 'react-router-dom';
import { getStatusColor } from '../../components/getStatusColor';

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

  const getPaymentStatusColor = (status: string) => {
    return status?.toLowerCase() === 'paid' 
      ? 'text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/20' 
      : 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">{error || 'Booking not found'}</p>
          <button 
            onClick={() => navigate('/services')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-pulse"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg border border-green-100 dark:border-green-900/50">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Thank you for choosing our service. Your booking has been successfully confirmed.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Details Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Booking Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{booking.serviceName}</h2>
                    <p className="text-blue-100 text-sm font-medium opacity-90">ID: #{booking.bookedOrderId.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border self-start sm:self-center ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                {/* Info Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4 shrink-0">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white capitalize truncate">{booking.customer}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 transition-colors">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4 shrink-0">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{booking.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4 shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{formatDate(booking.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-4 shrink-0">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{booking.time}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-4 mt-0.5 shadow-sm shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Service Location</p>
                      <div className="text-gray-900 dark:text-white">
                        <span className="font-bold block mb-0.5">{booking.address.label}</span>
                        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                          {booking.address.street}, {booking.address.city}, {booking.address.state} - {booking.address.zip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {booking.specialInstruction && (
                  <div className="p-4 sm:p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-4 shadow-sm shrink-0">
                        <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wider mb-1">Special Instructions</p>
                        <p className="text-gray-800 dark:text-gray-200 italic">"{booking.specialInstruction}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Actions */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                Payment Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CreditCard className="w-5 h-5 mr-3" />
                    <span className="font-medium">Total Amount</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{booking.amount}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 text-white text-xs font-bold shadow-sm">1</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Confirmation email sent to your inbox</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 text-white text-xs font-bold shadow-sm">2</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Provider will contact you 24 hours prior</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 text-white text-xs font-bold shadow-sm">3</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Track status in your dashboard</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/profile/booking-history')}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3.5 px-6 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98]">
                View My Bookings <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/services')}
                className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-3.5 px-6 rounded-xl font-semibold border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                Book Another Service
              </button>
            </div>
          </div>
        </div>

        {/* Footer Help */}
        <div className="mt-12 text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Our support team is here to assist you 24/7</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <a href="mailto:support@quickmate.com" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@quickmate.com
            </a>
            <a href="tel:+1-555-123-4567" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium">
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
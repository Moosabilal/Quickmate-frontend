import React from 'react';
import { CheckCircle, Calendar, MapPin, Phone, User, CreditCard } from 'lucide-react';

const BookingConfirmation = () => {
  // Sample booking data - replace with actual props
  const booking = {
    _id: "67891234567890abcdef1234",
    customerName: "John Doe",
    phone: "+1 (555) 123-4567",
    service: "Home Cleaning",
    amount: 150,
    bookingDate: new Date("2025-08-05T10:00:00"),
    status: "Confirmed",
    paymentStatus: "Paid",
    address: "123 Main Street, New York, NY 10001",
    instructions: "Please use side entrance, keys under the mat"
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your booking has been confirmed and we'll be in touch soon</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              booking.status === 'Confirmed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {booking.status}
            </span>
          </div>

          <div className="space-y-4">
            {/* Booking ID */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">Booking ID</dt>
                <dd className="text-sm text-gray-900 font-mono">#{booking._id.slice(-8).toUpperCase()}</dd>
              </div>
            </div>

            {/* Service */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">Service</dt>
                <dd className="text-sm text-gray-900">{booking.service}</dd>
              </div>
            </div>

            {/* Customer Info */}
            <div className="flex items-start">
              <User className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5" />
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">Customer</dt>
                <dd className="text-sm text-gray-900">{booking.customerName}</dd>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start">
              <Phone className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5" />
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{booking.phone}</dd>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start">
              <Calendar className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5" />
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                <dd className="text-sm text-gray-900">{formatDate(booking.bookingDate)}</dd>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start">
              <MapPin className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5" />
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="text-sm text-gray-900">{booking.address}</dd>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-start">
              <CreditCard className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5" />
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatCurrency(booking.amount)}</dd>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${
                  booking.paymentStatus === 'Paid' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </div>
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                <dd className={`text-sm font-medium ${
                  booking.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {booking.paymentStatus}
                </dd>
              </div>
            </div>

            {/* Instructions */}
            {booking.instructions && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <dt className="text-sm font-medium text-gray-500">Special Instructions</dt>
                  <dd className="text-sm text-gray-900">{booking.instructions}</dd>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Steps</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              We'll send you a confirmation email with all the details
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Our service provider will contact you 24 hours before the appointment
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              You can track your booking status in your account dashboard
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            View My Bookings
          </button>
          <button className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
            Book Another Service
          </button>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Need help? Contact us at{' '}
          <a href="mailto:support@quickmaker.com" className="text-blue-600 hover:underline">
            support@quickmaker.com
          </a>{' '}
          or{' '}
          <a href="tel:+1-555-123-4567" className="text-blue-600 hover:underline">
            +1 (555) 123-4567
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
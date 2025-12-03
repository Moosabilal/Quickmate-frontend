import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Shield,
  Download,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { BookingStatus, IBookingConfirmationPage } from '../../util/interface/IBooking';
import { getCloudinaryUrl } from '../../util/cloudinary';
import DeleteConfirmationModal from '../../components/deleteConfirmationModel';
import { toast } from 'react-toastify';
import DateTimePopup from '../../components/user/DateTimePopup';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { reviewService } from '../../services/reviewService';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BookingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<IBookingConfirmationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<IBookingConfirmationPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [dateTimePopup, setDateTimePopup] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [showRated, SetShowRated] = useState(false)


  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await bookingService.getBookingById(id!);
        console.log('the response in the details page is ', response);
        setBooking(response);
        setRating(response.rating || 0) 
        setReview(response.review || '') 
        setSelectedDate(response.date);
        setSelectedTime(response.time);
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

  const handleCancelBooking = async () => {
    if (!bookingToDelete) return;

    setIsDeleting(true);
    try {
      const { message } = await bookingService.updateBookingStatus(bookingToDelete.id, BookingStatus.CANCELLED);
      toast.info(message);
      setBooking((prev) => prev ? { ...prev, status: BookingStatus.CANCELLED } : prev);
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDateTimeConfirm = async (date: string, time: string) => {
    try {
      await bookingService.updateBookingDateTime(booking!.id, date, time);
      toast.success('Booking date and time updated successfully');
      setBooking((prev) => prev ? { ...prev, date, time } : prev);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update booking date and time');
      }
    }

    setDateTimePopup(false);
  };

  const handleReviewSubmit = async (bookingId: string) => {
    const response = await reviewService.addReview(bookingId, { rating, review })
    toast.success(response.message);
    setShowReviewForm(false);
    setRating(0);
    setReview('');
  }

  const handleDownloadReceipt = async () => {
    if (!booking) return;

    const receiptElement = document.getElementById('receipt-content');
    if (!receiptElement) {
      toast.error("Could not find receipt content to download.");
      return;
    }

    const toastId = toast.loading("Generating receipt...");

    try {
        const canvas = await html2canvas(receiptElement, { 
            scale: 2, 
            useCORS: true, 
            allowTaint: true, 
            logging: false,
            backgroundColor: '#ffffff', 
            scrollY: -window.scrollY 
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; 
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`Receipt-${booking.bookedOrderId}.pdf`);
        toast.update(toastId, { render: "Receipt downloaded!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
        console.error("PDF Generation failed:", error);
        toast.update(toastId, { render: "Failed to generate PDF.", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const timeSlots = Array.from({ length: 37 }, (_, i) => {
    const hour = Math.floor(i / 2) + 5;
    const minute = i % 2 === 0 ? '00' : '30';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute} ${period}`;
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking not found</h2>
          <button
            onClick={() => navigate('/profile/booking-history')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            Back to Booking History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type='button'
                onClick={() => navigate('/profile/booking-history')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-400"
                aria-label="Back to Booking History"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Details</h1>
                <p className="text-gray-600 dark:text-gray-400">Booking ID: #{booking.bookedOrderId.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type='button'
                onClick={handleDownloadReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-colors">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div id="receipt-content" className="lg:col-span-2 space-y-8 p-4 bg-white dark:bg-gray-900 rounded-lg"> {/* Added p-4 for padding in PDF */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6 text-white rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={getCloudinaryUrl(booking.serviceImage!)}
                      alt={booking.serviceName}
                      crossOrigin="anonymous"
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
                    <div className="text-blue-100 dark:text-blue-200">Total Amount</div>
                  </div>
                </div>
              </div>

              <div className="p-0">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Date</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
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
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Time & Duration</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {booking.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{booking.address.city}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Service Provider</h3>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={getCloudinaryUrl(booking.providerImage!)}
                      alt={booking.providerName}
                      crossOrigin="anonymous"
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{booking.providerName}</h4>
                    <p className="text-gray-600 dark:text-gray-400">Professional Service Provider</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Service Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Service</label>
                    <p className="font-semibold text-gray-900 dark:text-white">{booking.serviceName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Duration</label>
                    <p className="font-semibold text-gray-900 dark:text-white">{booking.priceUnit === "PerHour" ? `${booking.duration} hr` : booking.priceUnit}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Special Instruction</label>
                    <p className="font-semibold text-gray-900 dark:text-white">
                       {booking.specialInstruction ? booking.specialInstruction : <span className="text-gray-400 italic">None</span>}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Sub Total</label>
                    <p className="font-semibold text-gray-900 dark:text-white">₹{booking.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Address</label>
                    <p className="font-semibold text-gray-900 dark:text-white">{booking.address.label}</p>
                    <p className="text-gray-700 dark:text-gray-300">{booking.address.state}, {booking.address.city}</p>
                    <p className="text-gray-700 dark:text-gray-300">{booking.address.street}, {booking.address.zip}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Special Instructions</h3>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-amber-800 dark:text-amber-200">
                  {booking.specialInstruction || 'No special instructions provided.'}
                </p>
              </div>
            </div>

            {booking.status === 'Completed' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">After Service</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <p className="text-green-800 dark:text-green-200 mb-3">
                      ✓ Service completed successfully!
                    </p>
                    {!showReviewForm ? (
                      !booking.review && <button
                        onClick={() => setShowReviewForm(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Leave a Review
                      </button>
                    ) : (
                      <div className="space-y-4 mt-4">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-6 h-6 cursor-pointer ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                              onClick={() => setRating(star)}
                            />
                          ))}
                        </div>

                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Write your review here..."
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          rows={4}
                        />

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleReviewSubmit(booking.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                            disabled={!rating || !review.trim()}
                          >
                            Submit Review
                          </button>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Booking Status</h3>
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

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service Cost</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{booking.amount}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total Paid</span>
                  <span>₹{booking.amount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {booking.status === BookingStatus.COMPLETED && (
                  <button
                    onClick={() => SetShowRated(prev => !prev)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left text-gray-600 dark:text-gray-300"
                  >
                    <Star className="w-5 h-5" />
                    <span className="font-medium">Rate & Review</span>
                  </button>
                )}

                {showRated && (
                  <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${booking.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300">{booking.review || "No review provided"}</p>
                  </div>
                )}

                {(booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) &&
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left text-red-600 dark:text-red-400"
                    onClick={() => handleDeleteClick(booking)}
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Cancel Booking</span>
                  </button>}
              </div>
            </div>

          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleCancelBooking}
        itemType={DeleteConfirmationTypes.BOOKING}
        itemName={bookingToDelete?.serviceName || ''}
        itemDetails={bookingToDelete ? `Booking ID: #${bookingToDelete.bookedOrderId.slice(-8).toUpperCase()}\n ${bookingToDelete.serviceName}  • ₹${bookingToDelete?.amount}` : ''}
        isLoading={isDeleting}
        customMessage="Are you sure you want to cancel this booking?."
        additionalInfo={`If you cancel now, you may miss out on this service. \n ${bookingToDelete?.status === BookingStatus.CONFIRMED ? `You will only get 50% of Price refund, \n amount ${(bookingToDelete?.amount ?? 0) * 0.5} will be refunded to you account within 5-7 business days.` : `amount ${bookingToDelete?.amount} will be refunded to you account within 5-7 business days.`} `}
      />
      <DateTimePopup dateTimePopup={dateTimePopup} setDateTimePopup={setDateTimePopup} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedTime={selectedTime} setSelectedTime={setSelectedTime} timeSlots={timeSlots} handleDateTimeConfirm={handleDateTimeConfirm} providersTimings={booking.providerTimings} />

    </div>
  );
};

export default BookingDetails;
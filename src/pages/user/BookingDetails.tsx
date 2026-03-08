import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  XCircle,
  Shield,
  Download,
  AlertTriangle,
  Wrench,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { BookingStatus, IBookingConfirmationPage, WarrantyStatus } from '../../util/interface/IBooking';
import DeleteConfirmationModal from '../../components/deleteConfirmationModel';
import { toast } from 'react-toastify';
import DateTimePopup from '../../components/user/DateTimePopup';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { reviewService } from '../../services/reviewService';
import { reportService } from '../../services/reportService';
import { CalendarModal } from '../../components/user/CalendarModal';
import { getStatusColor } from '../../components/getStatusColor';
import { getStatusIcon } from '../../components/BookingStatusIcon';
import { isAxiosError } from 'axios';
import { useAppSelector } from '../../hooks/useAppSelector';

const BookingDetails: React.FC = () => {
  const navigate = useNavigate();
  const userRole = useAppSelector((state) => state.auth.user?.role);
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
  const [showRated, SetShowRated] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('Poor Quality Service');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showCalendarForWarranty, setShowCalendarForWarranty] = useState(false);
  const [warrantyIssue, setWarrantyIssue] = useState('');
  const [isClaimingWarranty, setIsClaimingWarranty] = useState(false);

  const fetchBookingDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(id);
      console.log('Fetched booking details:', response);

      setBooking(response);
      setRating(response.rating || 0);
      setReview(response.review || '');
      setSelectedDate(response.date);
      setSelectedTime(response.time);

      const userReports = await reportService.getUserReports();
      if (userReports.success && id) {
        const hasReport = userReports.reports.some((r: any) => {
          const reportBook = typeof r.bookingId === 'object' ? r.bookingId : null;
          const reportNodeId = (reportBook?._id || reportBook?.id || r.bookingId)?.toString();
          const reportParentId = reportBook?.parentBookingId?.toString();

          const currentNodeId = id?.toString();
          const currentParentId = response?.parentBookingId?.toString();

          if (!reportNodeId || !currentNodeId) return false;

          if (reportNodeId === currentNodeId) return true;
          if (currentParentId && reportNodeId === currentParentId) return true;
          if (reportParentId && reportParentId === currentNodeId) return true;
          if (currentParentId && reportParentId && reportParentId === currentParentId) return true;

          return false;
        });
        setHasReported(hasReport);
      }

    } catch (err) {
      console.error('Error fetching booking details:', err);

    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);


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
      const { message } = await bookingService.updateBookingStatus(bookingToDelete.id, BookingStatus.CANCELLED, userRole);
      toast.info(message);
      setBooking((prev) => prev ? { ...prev, status: BookingStatus.CANCELLED } : prev);
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (error) {
      let errorMessage = 'Failed to cancel booking';
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
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
    try {
      const response = await reviewService.addReview(bookingId, { rating, review })
      toast.success(response.message);
      setShowReviewForm(false);
      setRating(0);
      setReview('');
      await fetchBookingDetails();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to submit review')
      }
    }

  }

  const handleReportSubmit = async () => {
    if (!booking) return;
    setIsReporting(true);
    try {
      const response = await reportService.createReport(id!, reportReason, reportDescription);

      if (response.success) {
        toast.success(response.message || 'Report submitted successfully');
        setShowReportForm(false);
        setReportReason('Poor Quality Service');
        setReportDescription('');
        setHasReported(true);
      } else {
        toast.error(response.message || 'Failed to submit report');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to submit report');
      }
    } finally {
      setIsReporting(false);
    }
  }

  const handleWarrantyClaim = async (date: string, time: string) => {
    if (!booking || !warrantyIssue.trim()) return;

    setIsClaimingWarranty(true);
    try {
      const response = await bookingService.claimWarranty({
        originalBookingId: booking.id,
        issueDescription: warrantyIssue,
        requestedDate: date,
        requestedTime: time,
      });

      if (response.success) {
        toast.success(response.message || 'Warranty claim submitted successfully');
        setShowWarrantyModal(false);
        setWarrantyIssue('');
        await fetchBookingDetails();
      }
    } catch (error: any) {
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.message || 'Validation error');
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to claim warranty');
      } else {
        toast.error('Failed to claim warranty');
      }
    } finally {
      setIsClaimingWarranty(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!booking) return;

    const receiptElement = document.getElementById('receipt-content');
    if (!receiptElement) {
      toast.error("Could not find receipt content to download.");
      return;
    }

    const toastId = toast.loading("Generating receipt...");

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

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
                <p className="text-gray-600 dark:text-gray-400">Booking ID: #{(booking.bookedOrderId || booking.id).slice(-8).toUpperCase()}</p>
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
          <div id="receipt-content" className="lg:col-span-2 space-y-8 p-4 bg-white dark:bg-gray-900 rounded-lg">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6 text-white rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.serviceImage!}
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
                      src={booking.providerImage!}
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

            {booking.status === 'Completed' && (() => {
              const completionDate = booking.completedAt ? new Date(booking.completedAt) : new Date(booking.date);
              const validityEnd = new Date(completionDate);
              validityEnd.setDate(validityEnd.getDate() + 7);
              const today = new Date();
              const daysLeft = Math.ceil((validityEnd.getTime() - today.getTime()) / (1000 * 3600 * 24));
              const isValid = daysLeft > 0;

              const handleBookAgain = () => {
                navigate(`/service-detailsPage/${booking.serviceId}`, {
                  state: { preSelectedProviderId: booking.providerId }
                });
              };

              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Service Validity</h3>
                    {isValid ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <p className="font-semibold text-blue-800 dark:text-blue-200">
                            {booking.warrantyStatus === WarrantyStatus.CLAIMED ? 'Warranty claim in progress' : 'Covered under 7-Day Free Repair'}
                          </p>
                        </div>
                        {booking.warrantyStatus !== WarrantyStatus.CLAIMED && (
                          <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                            Your service is covered until {validityEnd.toLocaleDateString('en-US')}. If any issue arises prior to this date, you can contact the provider for a free repair.
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          {booking.warrantyStatus === WarrantyStatus.AVAILABLE ? (
                            <button
                              onClick={() => setShowWarrantyModal(true)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <Wrench className="w-4 h-4" /> Request Free Repair
                            </button>
                          ) : (
                            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium flex items-center gap-2 border border-gray-200 dark:border-gray-600">
                              <ShieldAlert className="w-4 h-4 text-orange-500" />
                              {booking.warrantyStatus === WarrantyStatus.CLAIMED ? 'Warranty claim in progress' : `Warranty ${booking.warrantyStatus}`}
                            </div>
                          )}
                          <button
                            onClick={handleBookAgain}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4" /> Book Again
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                        <p className="text-gray-600 dark:text-gray-400">Your 7-day free repair validity period has expired.</p>
                        <button
                          onClick={handleBookAgain}
                          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" /> Book This Service Again
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Feedback & Reporting</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-4">
                      {!showReviewForm && !showReportForm ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-gray-800 dark:text-gray-200 mb-2">Service completed successfully!</p>
                          <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            {!booking.review && (
                              <button
                                onClick={() => {
                                  setShowReviewForm(true)
                                  setShowReportForm(false)
                                }}
                                className="flex-1 px-4 py-2 border border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 font-medium rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                              >
                                Leave a Review
                              </button>
                            )}

                            {hasReported ? (
                              <button
                                disabled
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium rounded-lg opacity-80 cursor-not-allowed"
                              >
                                <ShieldAlert className="w-5 h-5" />
                                Report Submitted
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowReportForm(true)
                                  setShowReviewForm(false)
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-red-500 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <AlertTriangle className="w-5 h-5 pointer-events-none" />
                                Report Provider
                              </button>
                            )}
                          </div>
                        </div>
                      ) : showReviewForm ? (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Write a Review</h4>
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
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
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
                      ) : showReportForm ? (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Report Provider</h4>
                          <select
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="Poor Quality Service">Poor Quality Service</option>
                            <option value="Unprofessional Behavior">Unprofessional Behavior</option>
                            <option value="Overcharging">Overcharging</option>
                            <option value="Service Not Completed">Service Not Completed</option>
                            <option value="Other">Other</option>
                          </select>
                          <textarea
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            placeholder="Provide more details about the issue..."
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                            rows={4}
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleReportSubmit()}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                              disabled={isReporting || !reportDescription.trim()}
                            >
                              {isReporting ? 'Submitting...' : 'Submit Report'}
                            </button>
                            <button
                              onClick={() => {
                                setShowReportForm(false);
                                setReportDescription('');
                              }}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })()}

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
        itemDetails={bookingToDelete ? `Booking ID: #${(bookingToDelete.bookedOrderId || bookingToDelete.id).slice(-8).toUpperCase()}\n ${bookingToDelete.serviceName}  • ₹${bookingToDelete?.amount}` : ''}
        isLoading={isDeleting}
        customMessage="Are you sure you want to cancel this booking?."
        additionalInfo={`If you cancel now, you may miss out on this service. \n ${bookingToDelete?.status === BookingStatus.CONFIRMED ? `You will only get 50% of Price refund, \n amount ${(bookingToDelete?.amount ?? 0) * 0.5} will be refunded to you account within 5-7 business days.` : `amount ${bookingToDelete?.amount} will be refunded to you account within 5-7 business days.`} `}
      />
      <DateTimePopup dateTimePopup={dateTimePopup} setDateTimePopup={setDateTimePopup} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedTime={selectedTime} setSelectedTime={setSelectedTime} timeSlots={timeSlots} handleDateTimeConfirm={handleDateTimeConfirm} providersTimings={booking.providerTimings} />

      {showWarrantyModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-6 h-6 text-blue-600" />
                  Request Free Repair
                </h2>
                <button
                  onClick={() => setShowWarrantyModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Describe the issue
                </label>
                <textarea
                  className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
                  placeholder="Tell us what's wrong with the previous service..."
                  value={warrantyIssue}
                  onChange={(e) => setWarrantyIssue(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  * Note: This request is subject to provider availability and original service scope.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    if (!warrantyIssue.trim()) {
                      toast.warning('Please describe the issue first');
                      return;
                    }
                    setShowCalendarForWarranty(true);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                  disabled={!warrantyIssue.trim() || isClaimingWarranty}
                >
                  {isClaimingWarranty ? 'Processing...' : 'Schedule Rework Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CalendarModal
        isOpen={showCalendarForWarranty}
        onClose={() => setShowCalendarForWarranty(false)}
        latitude={booking.address.latitude || 0}
        longitude={booking.address.longitude || 0}
        radius={10}
        serviceId={booking.subCategoryId || booking.serviceId}
        providerId={booking.providerId}
        onSlotSelect={handleWarrantyClaim}
      />

    </div>
  );
};

export default BookingDetails;
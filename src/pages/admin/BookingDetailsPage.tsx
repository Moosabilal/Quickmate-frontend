import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Clock, MapPin, User,
    Briefcase, CreditCard,
    FileText, Phone, Mail, ShieldCheck
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { toast } from 'react-toastify';
import { IBookingDetailData } from '../../util/interface/IBooking';
import { getStatusColor } from '../../components/getStatusColor';
import { isAxiosError } from 'axios';

const BookingDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<IBookingDetailData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const response = await bookingService.getBookingDetails(id);
                setData(response.data);
            } catch (error) {
                console.error('Failed to load booking details',error);
                let errorMessage = "Failed to load booking details";
                if (isAxiosError(error) && error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }
                toast.error(errorMessage);
                navigate('/admin/bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading Booking...</p>
            </div>
        </div>
    );

    if (!data) return null;

    const { booking, user, provider, service, address, payment } = data;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 font-sans transition-colors duration-300">

            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 pb-32 pt-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-white/80 hover:text-white mb-8 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-white">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">Booking #{booking._id.slice(-6).toUpperCase()}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                </span>                    </div>
                            <p className="text-indigo-100 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Created on {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="text-right bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                            <p className="text-indigo-100 text-xs uppercase font-semibold mb-1">Total Amount</p>
                            <p className="text-4xl font-bold">₹{booking.amount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-500" /> Service Information
                                </h3>
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{service.title}</h2>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Duration: {service.duration}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">₹{service.price}</p>
                                        <p className="text-gray-400 text-xs uppercase">Base Price</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                        <div className="p-2.5 bg-white dark:bg-indigo-800 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-300"><Calendar className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mb-1">Scheduled Date</p>
                                            <p className="text-gray-900 dark:text-white font-semibold text-lg">{new Date(booking.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                        <div className="p-2.5 bg-white dark:bg-indigo-800 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-300"><Clock className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mb-1">Scheduled Time</p>
                                            <p className="text-gray-900 dark:text-white font-semibold text-lg">{booking.time}</p>
                                        </div>
                                    </div>
                                </div>

                                {booking.instructions && (
                                    <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl">
                                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Special Instructions
                                        </h4>
                                        <p className="text-sm text-amber-900 dark:text-amber-200 italic leading-relaxed">"{booking.instructions}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-emerald-500" /> Payment Details
                                </h3>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Payment Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${booking.paymentStatus === 'Paid'
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                        }`}>
                                        {booking.paymentStatus}
                                    </span>
                                </div>
                                {payment ? (
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Payment Method</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{payment.method}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                                            <span className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 select-all">
                                                {payment.transactionId}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Payment Date</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{new Date(payment.date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 italic">No payment record found.</div>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="space-y-8">

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" /> Customer
                            </h3>
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={user.image ? user.image : '/profileImage.png'}
                                    alt={user.name}
                                    className="w-16 h-16 rounded-full object-cover border-4 border-blue-50 dark:border-blue-900/30 shadow-sm"
                                />
                                <div>
                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</p>
                                    <p className="text-xs text-gray-400 font-mono mt-1">ID: {booking._id.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <div className="space-y-4 text-sm border-t border-gray-100 dark:border-gray-700 pt-6">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Mail className="w-4 h-4 text-gray-500" /></div>
                                    <span className="truncate" title={user.email}>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Phone className="w-4 h-4 text-gray-500" /></div>
                                    <span>{user.phone}</span>
                                </div>
                                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white mb-1 text-xs uppercase tracking-wide">{address.label}</p>
                                        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{address.fullAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-purple-500" /> Provider
                            </h3>
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={provider.image}
                                    alt={provider.name}
                                    className="w-16 h-16 rounded-full object-cover border-4 border-purple-50 dark:border-purple-900/30 shadow-sm"
                                />
                                <div>
                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{provider.name}</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {provider.serviceArea}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4 text-sm border-t border-gray-100 dark:border-gray-700 pt-6">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Mail className="w-4 h-4 text-gray-500" /></div>
                                    <span className="truncate" title={provider.email}>{provider.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Phone className="w-4 h-4 text-gray-500" /></div>
                                    <span>{provider.phone}</span>
                                </div>
                                <button
                                    onClick={() => navigate(`/admin/providers/${provider._id}`)} // Note: Use correct provider ID here if available in data
                                    className="w-full mt-2 py-2.5 text-xs font-bold uppercase tracking-wide text-purple-700 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors border border-purple-200 dark:border-purple-800"
                                >
                                    View Full Profile
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingDetailsPage;
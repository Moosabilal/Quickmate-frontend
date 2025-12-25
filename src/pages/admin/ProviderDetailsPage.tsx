import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Phone, Mail, Star, 
  Calendar, CheckCircle, XCircle,
  CreditCard, FileText, Briefcase, Clock, User, ExternalLink, 
  Activity, CalendarX, CalendarCheck,
  IndianRupee
} from 'lucide-react';
import { providerService } from '../../services/providerService';
import { toast } from 'react-toastify';
import { IProviderFullDetails } from '../../util/interface/IAdmin';
import { isAxiosError } from 'axios';

const ProviderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<IProviderFullDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const response = await providerService.getProviderFullDetails(id);
        setData(response);
      } catch (error) {
        console.error('Failed to fetch provider details:', error);
        let errorMessage = "Failed to load provider details";
        if (isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        navigate('/admin/providers');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-700 flex justify-center items-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 dark:text-gray-300 animate-pulse font-medium">Loading Profile...</p>
        </div>
    </div>
  );
  
  if (!data) return null;

  const { profile, services, bookings, stats, currentPlan } = data;
  console.log('the booking of the provider', bookings)
  const { availability } = profile; 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-700 pb-12 transition-colors duration-300">
      
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 pb-32 pt-8 sm:pt-12 px-4 sm:px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white mb-6 sm:mb-8 transition-colors group text-sm sm:text-base font-medium">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-white">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{profile.fullName}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-blue-100 text-sm sm:text-base">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.serviceArea}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm ${
                    profile.status === 'Approved' ? 'text-green-300 border-green-300/50' : 
                    profile.status === 'Rejected' ? 'text-red-300 border-red-300/50' : 'text-yellow-300 border-yellow-300/50'
                }`}>
                    {profile.status || 'Pending'}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-gray-600/50 transition-colors duration-300">
                    <div className="flex flex-col items-center text-center -mt-16 mb-6">
                        <div className="relative">
                            <img src={profile.profilePhoto} alt={profile.fullName} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md bg-slate-200 dark:bg-gray-700" />
                            <div className="absolute bottom-1 right-1 bg-yellow-400 p-1.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"><Star className="w-4 h-4 text-white fill-white" /></div>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.rating}</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider">Rating</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3 transition-colors">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0"><Mail className="w-5 h-5" /></div>
                            <div className="overflow-hidden min-w-0"><p className="text-xs text-slate-500 dark:text-gray-400">Email</p><p className="font-medium text-slate-900 dark:text-white truncate">{profile.email}</p></div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3 transition-colors">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0"><Phone className="w-5 h-5" /></div>
                            <div><p className="text-xs text-slate-500 dark:text-gray-400">Phone</p><p className="font-medium text-slate-900 dark:text-white">{profile.phoneNumber}</p></div>
                        </div>
                         <div className="p-3 bg-slate-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3 transition-colors">
                            <div className={`p-2 rounded-lg shrink-0 ${profile.isVerified ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                {profile.isVerified ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </div>
                            <div><p className="text-xs text-slate-500 dark:text-gray-400">Verification</p><p className="font-medium text-slate-900 dark:text-white">{profile.isVerified ? 'Verified Account' : 'Not Verified'}</p></div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-gray-600/50 transition-colors duration-300">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Subscription
                     </h3>
                     {profile.subscription ? (
                         <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-gray-900 dark:to-gray-800 p-5 text-white shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div><p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Current Plan</p>
                                <p className="text-xl font-bold mt-1 tracking-tight">
                                    {currentPlan ? currentPlan.name : "No Active Plan"}
                                </p>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${profile.subscription.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>{profile.subscription.status}</div>
                            </div>
                            {profile.subscription.status === 'ACTIVE' && 
                            <div className="space-y-1 text-sm text-slate-300 font-medium">
                                <p>Start: <span className="text-white ml-1">{new Date(profile.subscription.startDate).toLocaleDateString()}</span></p>
                                <p>End: <span className="text-white ml-2">{new Date(profile.subscription.endDate).toLocaleDateString()}</span></p>
                            </div>}
                        </div>
                     ) : <div className="p-4 bg-slate-50 dark:bg-gray-700/30 rounded-xl text-center text-slate-500 dark:text-gray-400 italic text-sm">No active subscription</div>}
                </div>
            </div>

            <div className="lg:col-span-2 space-y-8">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-600/50 flex flex-col items-center justify-center text-center hover:shadow-md transition-all duration-300 group">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-3 group-hover:scale-110 transition-transform"><IndianRupee className="w-6 h-6" /></div>
                        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Total Earnings</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{stats.totalEarnings}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-600/50 flex flex-col items-center justify-center text-center hover:shadow-md transition-all duration-300 group">
                         <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-3 group-hover:scale-110 transition-transform"><Briefcase className="w-6 h-6" /></div>
                        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Total Bookings</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-600/50 flex flex-col items-center justify-center text-center hover:shadow-md transition-all duration-300 group">
                         <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mb-3 group-hover:scale-110 transition-transform"><Activity className="w-6 h-6" /></div>
                        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Pending Payout</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{profile.payoutPending || 0}</p>
                    </div>
                </div>
                
                {availability && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-gray-600/50 transition-colors duration-300">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-teal-500 dark:text-teal-400" /> Availability & Schedule
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">Weekly Hours</h4>
                                <div className="space-y-2">
                                    {availability.weeklySchedule.map((day, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <span className={`font-medium ${day.active ? 'text-slate-700 dark:text-gray-200' : 'text-slate-400 dark:text-gray-500 line-through'}`}>
                                                {day.day}
                                            </span>
                                            {day.active ? (
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                    {day.slots.map(s => `${s.start} - ${s.end}`).join(', ')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 dark:text-gray-500 text-xs">Closed</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">Upcoming Leaves</h4>
                                    {availability.leavePeriods.length > 0 ? (
                                        <div className="space-y-2">
                                            {availability.leavePeriods.map((leave, idx) => (
                                                <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg flex items-start gap-3">
                                                    <CalendarX className="w-4 h-4 text-orange-500 dark:text-orange-400 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                                                            {leave.from} <span className="text-orange-400/70 mx-1">to</span> {leave.to}
                                                        </p>
                                                        {leave.reason && <p className="text-xs text-orange-600 dark:text-orange-400/80 mt-0.5">"{leave.reason}"</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-gray-400 italic bg-slate-50 dark:bg-gray-700/30 p-3 rounded-lg">No leaves scheduled.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">Date Overrides</h4>
                                    {availability.dateOverrides.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {availability.dateOverrides.map((override, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 text-xs rounded-md border border-red-100 dark:border-red-900/30 font-medium flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> {override.date}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-gray-400 italic bg-slate-50 dark:bg-gray-700/30 p-3 rounded-lg">No date overrides active.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-gray-600/50 transition-colors duration-300">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Services Portfolio
                    </h3>
                    {services.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map(service => (
                                <div key={service._id} className="p-4 rounded-xl border border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group bg-white dark:bg-gray-800/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{service.title}</h4>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-2 mb-3">{service.description}</p>
                                    <div className="flex items-center justify-between text-sm font-medium pt-3 border-t border-slate-100 dark:border-gray-700/50">
                                        <span className="text-slate-900 dark:text-white">₹{service.price}<span className="text-slate-400 dark:text-gray-500 font-normal text-xs ml-0.5">/{service.priceUnit}</span></span>
                                        <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400 text-xs"><Clock className="w-3 h-3" /> {service.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-slate-300 dark:border-gray-600">No services added yet.</div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-gray-600/50 transition-colors duration-300">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                            <Calendar className="w-5 h-5 text-purple-500 dark:text-purple-400" /> Recent Bookings
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 dark:text-gray-400 uppercase bg-slate-50 dark:bg-gray-700/50 border-b border-slate-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                    <th className="px-6 py-3 font-semibold">Customer</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                                {bookings.length > 0 ? (
                                    bookings.map(booking => (
                                        <tr key={booking._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{new Date(booking.scheduledDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-gray-200">{booking.customerName}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    booking.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                                                    booking.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-800 dark:text-gray-200 font-medium">₹{booking.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-gray-400">No bookings found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-gray-600/50 transition-colors duration-300">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500 dark:text-orange-400" /> Documents
                    </h3>
                    <div className="flex gap-4">
                         <div className="flex items-center justify-between p-4 w-full max-w-md bg-slate-50 dark:bg-gray-700/30 border border-slate-200 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group" onClick={() => window.open(profile.aadhaarIdProof, '_blank')}>
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                                     <User className="w-5 h-5 text-slate-600 dark:text-gray-300" />
                                 </div>
                                 <div>
                                     <p className="font-semibold text-slate-900 dark:text-white text-sm">ID Proof</p>
                                     <p className="text-xs text-slate-500 dark:text-gray-400">Aadhaar / Identity Card</p>
                                 </div>
                             </div>
                             <ExternalLink className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                         </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsPage;
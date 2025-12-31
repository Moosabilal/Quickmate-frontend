import React, { useEffect, useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ICategoryFormCombinedData, IserviceResponse } from '../../util/interface/ICategory';
import { Star, MapPin, Calendar, User, CreditCard, CheckCircle, ChevronRight, Clock, Phone, FileText, Loader2, AlertTriangle } from 'lucide-react'; 
import ProviderPopup from './ProviderPopupPage';
import AddressPopup from '../../components/user/AddressPopup';
import { IBackendProvider } from '../../util/interface/IProvider';
import { toast } from 'react-toastify';
import { bookingService } from '../../services/bookingService';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PaymentMethod, paymentVerificationRequest } from '../../util/interface/IPayment';
import { IAddress } from '../../util/interface/IAddress';
import { addressService } from '../../services/addressService';
import { walletService } from '../../services/walletService';
import { CalendarModal } from '../../components/user/CalendarModal';
import { RazorpayOptions, RazorpayPaymentFailedResponse, RazorpayResponse } from '../../util/interface/IRazorpay';

const paymentKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

const ServiceDetailsPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth)
  const { serviceId } = useParams<{ serviceId: string }>();

  const [serviceDetails, setServiceDetails] = useState<ICategoryFormCombinedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerPopup, setProviderPopup] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<IBackendProvider | null>(null);
  const [addressPopup, setAddressPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [relatedServices, setRelatedServices] = useState<IserviceResponse[]>([]);
  const [newAddress, setNewAddress] = useState<IAddress>({
    label: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    locationCoords: '',
  });
  const [radius, setRadius] = useState(10)
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK);
  const [showCalendar, setShowCalendar] = useState(false)

  const paymentOptions = [
    { value: PaymentMethod.BANK, label: "Online Payment (Razorpay)" },
    { value: PaymentMethod.WALLET, label: "Wallet" },
  ]

  const handleSlotSelection = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedProvider(null)
    setShowCalendar(false);
    setProviderPopup(true);
  };

  const fetchWallet = async () => {
    try {
      const res = await walletService.getWallet()
      return res.data.wallet.balance
    } catch (error) {
      if(error instanceof Error){
        toast.error(error.message)
      } else {
        toast.error('Failed to fetch wallet balance')
      }
      return 0
    }
  }

  const navigate = useNavigate()

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await categoryService.getCategoryForEditAndShow(serviceId || '');
        console.log('the rsponse ins the frontend', response)
        setServiceDetails(response);
      } catch (err) {
        console.error('Failed to fetch service details:', err);
        setError('Failed to load service details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchServiceDetails();
  }, [serviceId]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!serviceId) return;
      try {
        const related = await categoryService.getRelatedServices(serviceId);
        setRelatedServices(related);
      } catch (err) {
        console.error("Failed to load related services", err);
      }
    };
    
    fetchRelated();
  }, [serviceId]);

  const handleAddAddress = async (address: IAddress) => {
    if (address.label && address.street && address.city && address.state && address.zip && address.locationCoords) {
      const newAddressObj = {
        id: String(Date.now()),
        ...address,
      };
      try {
        await addressService.createAddress(newAddressObj)
      } catch (error) {
        if(error instanceof Error){
          toast.error(error.message)
        } else {
          toast.error('Something went wrong! Please try again later')
        }
      }
      setSelectedAddress(newAddressObj);
      setShowAddAddress(false);
      setNewAddress({ label: '', street: '', city: '', state: '', zip: '', locationCoords: '' });
      setAddressPopup(false);
    }
  };

  const handleAddressConfirm = (address: IAddress, radius: number) => {
    setSelectedAddress(address);
    setRadius(radius);
    setAddressPopup(false);
  };


  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

     if (!selectedAddress || !selectedProvider || !fullName || !phone) {
      toast.error("Please complete all required fields.");
      return;
    }

    if(!/^\d{10}$/.test(phone)) {
      toast.warn("Please enter a valid 10-digit phone number.");
      return;
    }

    const currentBalance = await fetchWallet()

    if (paymentMethod === PaymentMethod.WALLET) {
      if (currentBalance < Number(selectedProvider?.price)) {
        toast.info('Insufficient balance in wallet')
        return;
      }
      const bookingResponse = await handleSubmit(e);
      try {
        if (!selectedProvider) {
          toast.error("No provider selected for payment.");
          return;
        }
        const walletPayment: paymentVerificationRequest = {
          providerId: selectedProvider._id,
          bookingId: bookingResponse.bookingId,
          paymentMethod: paymentMethod,
          paymentDate: new Date(),
          amount: Number(selectedProvider?.price),
          razorpay_order_id: `${Date.now()}`,
        };
        const validationRes = await bookingService.verifyPayment(walletPayment);
        toast.success(`OrderId ${validationRes.orderId} ${validationRes.message}`);
        navigate(`/confirmationModel/${bookingResponse.bookingId}`)
      } catch (error) {
        toast.error(`booking failed please try again later, ${error}`)
      }
      return
    }
    const amount = selectedProvider?.price;

    const orderResponse = await bookingService.confirmPayment(Number(amount))

    const options: RazorpayOptions = {
      "key": paymentKey,
      amount: Number(amount) * 100,
      currency: 'INR',
      "name": "QuickMate",
      "description": "Service Booking Payment",
      "image": "https://example.com/your_logo",
      "order_id": orderResponse.id,
      handler: async function (paymentResponse: RazorpayResponse) {
        try {
          const bookingRes = await handleSubmit(e);
          console.log('the booking res', bookingRes)
          if (!bookingRes?.bookingId) {
            toast.error("Booking failed before payment verification.");
            return;
          }
          if (!selectedProvider) {
            throw new Error("No provider selected.");
          }

          const paymentRequest: paymentVerificationRequest = {
            providerId: selectedProvider._id,
            bookingId: bookingRes.bookingId,
            paymentMethod: paymentMethod,
            paymentDate: new Date(),
            amount: Number(amount),
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          };

          const validationRes = await bookingService.verifyPayment(paymentRequest);
          toast.success(`OrderId ${validationRes.orderId} ${validationRes.message}`);
          navigate(`/confirmationModel/${bookingRes.bookingId}`)
        } catch (err) {
          console.error("Payment handler error:", err);
          toast.error("Payment verification failed.");
        }
      },
      "prefill": {
        "name": fullName,
        "email": user?.email,
        "contact": phone,
      },
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "theme": {
        "color": "#3057b0ff"
      }
    } as RazorpayOptions;
    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response: RazorpayPaymentFailedResponse) {
      toast.error(`${response.error.reason} for OrderId: ${response.error.metadata?.order_id}`);
    });
    rzp1.open();
    e.preventDefault();

  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddress || !selectedProvider || !fullName || !phone) {
      toast.error("Please complete all required fields.");
      return;
    }

    if(!/^\d{10}$/.test(phone)) {
      toast.warn("Please enter a valid 10-digit phone number.");
      return;
    }

    

    const bookingPayload = {
      userId: user?.id,
      serviceId: serviceId!,
      providerId: selectedProvider._id,
      customerName: fullName,
      phone: phone,
      amount: Number(selectedProvider.price),
      instructions: instructions,
      addressId: selectedAddress.id,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
    };

    try {
      return await bookingService.createBooking(bookingPayload);
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error(err instanceof Error ? err.message : "Booking failed. Please try again.");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center transition-colors duration-300">
        <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 animate-pulse">Loading service details...</p>
      </div>
    );
  }

  if (error || !serviceDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center transition-colors duration-300">
         <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Oops!</h2>
            <p className="text-lg text-red-600 dark:text-red-300">{error || 'Service not found.'}</p>
            <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">Go Back</button>
         </div>
      </div>
    );
  }

  const isStep1Complete = !!selectedAddress;
  const isStep2Complete = isStep1Complete && !!selectedDate && !!selectedTime;
  const isStep3Complete = isStep2Complete && !!selectedProvider;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors duration-300">
      
      <div className="relative h-80 sm:h-96 w-full bg-gray-900">
        <img
            src={serviceDetails.iconUrl || ''}
            alt={serviceDetails.name}
            className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent dark:from-gray-900"></div>
        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
             <button onClick={() => window.history.back()} className="absolute top-8 left-4 sm:left-8 flex items-center text-white/80 hover:text-white transition-colors group bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <ChevronRight className="w-5 h-5 rotate-180 mr-1 group-hover:-translate-x-1 transition-transform" /> Back
             </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">{serviceDetails.name}</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl drop-shadow leading-relaxed">
                {serviceDetails.description || 'Experience top-tier service from our verified professionals.'}
            </p>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">

          <div className="w-full lg:w-2/3 space-y-10">
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-transparent dark:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" /> About This Service
              </h2>
              <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>{serviceDetails.description}</p>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>
            </div>

            {relatedServices.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">You Might Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {relatedServices.map((service) => (
                            <Link 
                                to={`/service-detailsPage/${service.id}`} 
                                key={service.id}
                                className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-2xl dark:hover:shadow-gray-900/30 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex h-32">
                                    <div className="w-1/3 overflow-hidden relative">
                                        <img 
                                            src={service.iconUrl || ''} 
                                            alt={service.name} 
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <div className="w-2/3 p-4 flex flex-col justify-center">
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {service.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                            Explore reliable providers for {service.name.toLowerCase()}.
                                        </p>
                                        <span className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center group/btn">
                                            View Service <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Service</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Complete the steps to schedule.</p>
                </div>

                <form className="space-y-5">
                    <div className={`p-4 rounded-xl border transition-all duration-300 ${
                        isStep1Complete 
                        ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800'
                    }`}>
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
                            <span className="flex items-center"><MapPin className={`w-5 h-5 mr-2 ${isStep1Complete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} /> 1. Location</span>
                            {isStep1Complete && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                        </h3>
                        <button type="button" onClick={() => setAddressPopup(true)} className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${selectedAddress ? "bg-white dark:bg-gray-700 border-green-200 dark:border-green-800 text-gray-900 dark:text-white font-medium shadow-sm" : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 border-dashed border-2"}`}>
                            {selectedAddress ? (
                                <div className='flex items-center'><MapPin className="w-4 h-4 mr-2 text-green-600 dark:text-green-400 flex-shrink-0" /> <span className="truncate">{selectedAddress.label}: {selectedAddress.street}, {selectedAddress.city}</span></div>
                            ) : "Select your address"}
                        </button>
                    </div>

                    <div className={`p-4 rounded-xl border transition-all duration-300 ${
                        isStep2Complete 
                        ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30'
                    } ${!isStep1Complete ? 'opacity-60 pointer-events-none' : 'hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800'}`}>
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
                            <span className="flex items-center"><Calendar className={`w-5 h-5 mr-2 ${isStep2Complete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} /> 2. Date & Time</span>
                            {isStep2Complete && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                        </h3>
                        {selectedDate && selectedTime ? (
                             <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-green-200 dark:border-green-800 shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-green-800 dark:text-green-300 text-sm flex items-center"><Calendar className="w-4 h-4 mr-2" /> {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                    <p className="text-green-700 dark:text-green-400 text-sm mt-1 flex items-center"><Clock className="w-4 h-4 mr-2" /> {selectedTime}</p>
                                </div>
                                <button type="button" onClick={() => setShowCalendar(true)} className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 underline font-medium">Change</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setShowCalendar(true)} disabled={!selectedAddress} className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md text-sm font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                <Calendar className="w-4 h-4 mr-2" /> Check Availability
                            </button>
                        )}
                    </div>

                    {isStep2Complete && (
                        <div className={`p-4 rounded-xl border transition-all duration-300 ${
                            isStep3Complete 
                            ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' 
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800'
                        }`}>
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
                                <span className="flex items-center"><User className={`w-5 h-5 mr-2 ${isStep3Complete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} /> 3. Provider</span>
                                {isStep3Complete && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                            </h3>
                            {selectedProvider ? (
                                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={selectedProvider.profilePhoto} alt={selectedProvider.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 shadow-sm" />
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{selectedProvider.fullName}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                                                    <span className="flex items-center bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full"><Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-1" />{selectedProvider.rating}</span>
                                                    <span className="font-medium text-green-700 dark:text-green-400">₹{selectedProvider.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setProviderPopup(true)} className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 underline font-medium">Change</button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" onClick={() => setProviderPopup(true)} className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md text-sm font-semibold">
                                    Select Provider
                                </button>
                            )}
                        </div>
                    )}

                    {isStep3Complete && (
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" /> 4. Final Details</h3>
                            <div className="space-y-4 mb-6">
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <input 
                                        type="text" 
                                        id="fullName" 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                        placeholder="Your Name" 
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800" 
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <input 
                                        type="tel" 
                                        id="phone" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        placeholder="Phone Number" 
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800" 
                                    />
                                </div>
                                <textarea 
                                    id="instructions" 
                                    rows={2} 
                                    value={instructions} 
                                    onChange={(e) => setInstructions(e.target.value)} 
                                    placeholder="Special instructions (optional)..." 
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800" 
                                />
                            </div>

                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center"><CreditCard className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" /> Payment Method</h3>
                            <div className="space-y-2 mb-6">
                                {paymentOptions.map((method) => (
                                    <label key={method.value} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === method.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                        <input type="radio" name="paymentMethod" value={method.value} checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600" />
                                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-200">{method.label}</span>
                                    </label>
                                ))}
                            </div>

                            <button type="submit" onClick={handlePayment} disabled={!fullName || !phone} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3.5 px-4 rounded-xl text-base hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]">
                                Confirm Booking • ₹{selectedProvider.price}
                            </button>
                        </div>
                    )}
                </form>
            </div>
          </div>
        </div>
      </main>
      
      <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} latitude={selectedAddress?.locationCoords ? Number(selectedAddress.locationCoords.split(',')[0]) : 0} longitude={selectedAddress?.locationCoords ? Number(selectedAddress.locationCoords.split(',')[1]) : 0} serviceId={serviceId || ''} radius={radius} onSlotSelect={handleSlotSelection} />
      {providerPopup && <ProviderPopup setSelectedProvider={setSelectedProvider} providerPopup={providerPopup} selectedProvider={selectedProvider} setProviderPopup={setProviderPopup} serviceId={serviceId || ''} selectedDate={selectedDate} selectedTime={selectedTime} latitude={selectedAddress?.locationCoords ? Number(selectedAddress.locationCoords.split(',')[0]) : 0} longitude={selectedAddress?.locationCoords ? Number(selectedAddress.locationCoords.split(',')[1]) : 0} radiusKm={radius} />}
      <AddressPopup addressPopup={addressPopup} setAddressPopup={setAddressPopup} selectedAddress={selectedAddress} handleAddressConfirm={handleAddressConfirm} setShowAddAddress={setShowAddAddress} showAddAddress={showAddAddress} newAddress={newAddress} setNewAddress={setNewAddress} handleAddAddress={handleAddAddress} serviceId={serviceId || ''} />
    </div>
  );
};

export default ServiceDetailsPage;
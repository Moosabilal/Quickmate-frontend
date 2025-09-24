import React, { useEffect, useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { useNavigate, useParams } from 'react-router-dom';
import { ICategoryResponse } from '../../util/interface/ICategory';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { Star, MapPin, Award, CalendarClockIcon, IndianRupee, Calendar, X, Clock, CalendarIcon } from 'lucide-react';
import ProviderPopup from './ProviderPopupPage';
import DateTimePopup from '../../components/user/DateTimePopup';
import AddressPopup from '../../components/user/AddressPopup';
import { FilterParams, IBackendProvider } from '../../util/interface/IProvider';
import { toast } from 'react-toastify';
import { bookingService } from '../../services/bookingService';
import { IProvider } from '../../util/interface/IProvider';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PaymentMethod, paymentVerificationRequest } from '../../util/interface/IPayment';
import { IAddress } from '../../util/interface/IAddress';
import { providerService } from '../../services/providerService';
import { addressService } from '../../services/addressService';
import { walletService } from '../../services/walletService';
import { all } from 'axios';
const paymentKey = import.meta.env.VITE_RAZORPAY_KEY_ID

declare var Razorpay: any;



interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}



const ServiceDetailsPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth)
  const { serviceId } = useParams<{ serviceId: string }>();
  const [serviceDetails, setServiceDetails] = useState<ICategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerPopup, setProviderPopup] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<IBackendProvider | null>(null);
  const [dateTimePopup, setDateTimePopup] = useState(false);
  const [addressPopup, setAddressPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
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
  const [allProviders, setAllProviders] = useState<IBackendProvider[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK);
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [showCalendar, setShowCalendar] = useState(false)

  console.log('the all provider we are getting', allProviders)

  const paymentOptions = [
    { value: PaymentMethod.BANK, label: "Online Payment (Razorpay)" },
    { value: PaymentMethod.WALLET, label: "Wallet" },
  ]

  const providersLocations = Array.from(new Set(allProviders.map(provider => provider.serviceLocation)));
  const providerTimes = Array.from(new Set(allProviders.map(provider => provider.availability).flat()));
  console.log('the provider times', providerTimes)


 const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const [availability, setAvailability] = useState<
    { providerName: string; date: string; slots: string[] }[]
  >([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Helper function to convert UTC time to local time and format consistently
  const formatTimeSlot = (utcTime: Date): string => {
    return utcTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Helper function to convert local time to 24-hour format for backend
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Fetch availability for the selected providers
  const fetchAvailability = async () => {
    if (!allProviders.length) return;
    setLoading(true);

    try {
      const providerIds = allProviders.map((provider) => provider._id);
      console.log("Provider IDs:", providerIds);

      const response = await providerService.getProviderAvailability(providerIds);
      console.log("Backend response:", response);

      const allSlots: { providerName: string; date: string; slots: string[] }[] = [];

      Object.entries(response).forEach(([providerId, slots]) => {
        const provider = allProviders.find((p) => p._id === providerId);
        if (!provider || !slots) return;

        const slotsByDate: { [date: string]: string[] } = {};

        (slots as { start: string; end: string }[]).forEach((slot) => {
          const startDate = new Date(slot.start);
          const endDate = new Date(slot.end);
          const dateKey = startDate.toISOString().split("T")[0];

          if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];

          // Generate hourly slots between start and end time
          let current = new Date(startDate);
          while (current < endDate) {
            const timeString = formatTimeSlot(current);
            if (!slotsByDate[dateKey].includes(timeString)) {
              slotsByDate[dateKey].push(timeString);
            }
            current.setHours(current.getHours() + 1);
          }
          
          // Sort time slots chronologically
          slotsByDate[dateKey].sort((a, b) => {
            const timeA = convertTo24Hour(a);
            const timeB = convertTo24Hour(b);
            return timeA.localeCompare(timeB);
          });
        });

        Object.entries(slotsByDate).forEach(([date, slots]) => {
          allSlots.push({ providerName: provider.fullName, date, slots });
        });
      });

      setAvailability(allSlots);
    } catch (error) {
      console.error("Error fetching provider availability:", error);
      toast.error("Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (date: string, time: string) => {
    console.log("Selected time from calendar:", time);
    console.log("Converted to 24h format:", convertTo24Hour(time));
    
    setSelectedDate(date);
    setSelectedTime(time); // Keep the 12-hour format for display
    onClose();
  };

  useEffect(() => {
    if (selectedAddress) {
      fetchAvailability();
    }
  }, [selectedAddress]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-indigo-50">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Provider Availability</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side - Available Slots */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> Available Time Slots
              </h3>

              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="ml-3">Loading availability...</p>
                </div>
              ) : availability.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No available slots for the selected providers at this location.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availability.map((entry, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {entry.providerName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {entry.slots.map((slot, i) => (
                          <button
                            key={i}
                            onClick={() => handleTimeSlotClick(entry.date, slot)}
                            className="px-3 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-all duration-200 text-sm font-medium border border-green-200 hover:border-green-300"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Google Calendar Embed */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Calendar View</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <iframe
                  src="https://calendar.google.com/calendar/embed?src=bcbe92b9d4f0d42530c5902c2c8d5dc0bed7c6394c89a38c42e24b532ac95258%40group.calendar.google.com&ctz=Asia%2FKolkata"
                  style={{ border: 0, width: "100%", height: "400px", borderRadius: "8px" }}
                  frameBorder="0"
                  scrolling="no"
                  title="Provider Availability Calendar"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Green slots represent available time slots
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


  const getProvider = async (filterParams: FilterParams = {}) => {
    try {
      if (selectedAddress) {
        filterParams.radius = radius;
        filterParams.locationCoords = selectedAddress.locationCoords
      }
      console.log('the selelcitnieae', selectedAddress)

      console.log('the provideradsfasdfdsf', filterParams)
      const providers = await providerService.getserviceProvider(serviceId!, filterParams);
      setAllProviders(providers);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch providers');
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await walletService.getWallet()
      setWalletBalance(res.data.wallet.balance)
    } catch (error) {

    }
  }

  useEffect(() => {
    console.log('working')
    if (serviceId) {
      getProvider();
    }

  }, []);

  const navigate = useNavigate()

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await categoryService.getCategoryById(serviceId || '');
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

  const handleAddAddress = async (address: IAddress) => {
    if (address.label && address.street && address.city && address.state && address.zip && address.locationCoords) {
      const newAddressObj = {
        id: String(Date.now()),
        ...address,
      };
      try {
        await addressService.createAddress(newAddressObj)
      } catch (error) {
        toast.error('Something went wrong! Please try again later')
      }
      setSelectedAddress(newAddressObj);
      setShowAddAddress(false);
      setNewAddress({ label: '', street: '', city: '', state: '', zip: '', locationCoords: '' });
      setAddressPopup(false);
    }
  };

  const handleDateTimeConfirm = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setDateTimePopup(false);
  };

  const handleAddressConfirm = (address: IAddress, radius: number) => {
    setSelectedAddress(address);
    setRadius(radius);
    setAddressPopup(false);
  };

  const timeSlots = Array.from({ length: 37 }, (_, i) => {
    const hour = Math.floor(i / 2) + 5;
    const minute = i % 2 === 0 ? '00' : '30';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute} ${period}`;
  });


  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

     await fetchWallet()

    if (paymentMethod === PaymentMethod.WALLET) {
      if (walletBalance < Number(selectedProvider?.price)) {
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

    var options = {
      "key": paymentKey,
      amount: Number(amount) * 100,
      currency: 'INR',
      "name": "QuickMate",
      "description": "Service Booking Payment",
      "image": "https://example.com/your_logo",
      "order_id": orderResponse.id,
      handler: async function (paymentResponse: any) {
        try {
          const bookingRes = await handleSubmit(e);
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
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response: { error: { reason: any; metadata: { order_id: any; }; }; }) {
      toast.error(`${response.error.reason} for OrderId: ${response.error.metadata.order_id}`);
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
      toast.error("Failed to confirm booking. Please try again.");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading service details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  if (!serviceDetails) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-700">Service not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      <main className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 flex-grow">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-indigo-700 hover:text-indigo-900 transition-colors duration-200 mb-8 text-lg font-medium group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Services
        </button>

        <div className="flex flex-col md:flex-row gap-10 max-w-6xl mx-auto">
          <div className="w-full md:w-2/2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-center mb-8">
              <img
                src={getCloudinaryUrl(serviceDetails.iconUrl || '')}
                alt={serviceDetails.name}
                className="w-full max-w-sm h-64 object-cover rounded-xl shadow-lg border-2 border-gray-300 transform transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="md:ml-14">
              <h1 className="text-4xl font-extrabold text-gray-800 mb-4 leading-tight">{serviceDetails.name}</h1>
              {/* <p className="text-2xl text-indigo-600 font-bold mb-6">Starting at ₹ 100</p> */}
              <p className="text-gray-700 leading-relaxed text-lg mb-8">
                {serviceDetails.description || 'No detailed description available.'}<br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-indigo-800 mb-6 text-center">
              Book Your Service
            </h2>

            <form className="space-y-6">
              <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                <h3 className="text-base font-semibold text-indigo-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Select Address
                </h3>
                <button
                  type="button"
                  onClick={() => setAddressPopup(true)}
                  className="w-full px-4 py-2 rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition duration-300 border border-indigo-300 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 flex items-center justify-center"
                >
                  {selectedAddress
                    ? `${selectedAddress.label}: ${selectedAddress.street}, ${selectedAddress.city}`
                    : "Choose Address"}
                </button>
              </div>


              <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                <h3 className="text-base font-semibold text-indigo-700 mb-2 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Check Availability
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCalendar(true)}
                  disabled={!selectedAddress}
                  className={`w-full px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-300 shadow text-sm focus:outline-none flex items-center justify-center gap-2 ${!selectedAddress ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  title={!selectedAddress ? "Please select your location first" : ""}
                >
                  <Calendar className="w-4 h-4" />
                  View Availability Calendar
                </button>
              </div>

              {/* Selected Date & Time Display */}
              {selectedDate && selectedTime && (
                <div className="p-4 rounded-xl border border-green-200 shadow-sm bg-green-50">
                  <h3 className="text-base font-semibold text-green-700 mb-2">Selected Slot</h3>
                  <div className="text-sm text-green-800">
                    <p className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>Time: {selectedTime}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className="mt-2 text-xs text-green-600 hover:text-green-800 underline"
                  >
                    Change time slot
                  </button>
                </div>
              )}


              <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                <h3 className="text-base font-semibold text-indigo-700 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Select Service Provider
                </h3>
                <button
                  type="button"
                  disabled={!selectedAddress}
                  onClick={() => setProviderPopup(true)}
                  className={`w-full px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 shadow text-sm focus:outline-none flex items-center justify-center ${!selectedAddress ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  title={!selectedAddress ? "Please select your location first" : ""}
                >
                  {selectedProvider
                    ? `Selected: ${selectedProvider.fullName}`
                    : "Choose Provider"}
                </button>

                {selectedProvider && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img
                        src={getCloudinaryUrl(selectedProvider.profilePhoto)}
                        alt={selectedProvider.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{selectedProvider.fullName}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>
                            {selectedProvider.rating} • ₹{selectedProvider.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                <h3 className="text-base font-semibold text-indigo-700 mb-2 flex items-center">
                  <CalendarClockIcon className="w-4 h-4 mr-2" />
                  Select Date & Time
                </h3>
                <button
                  type="button"
                  onClick={() => setDateTimePopup(true)}
                  className={`w-full px-4 py-2 rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition duration-300 border border-indigo-300 shadow-sm text-sm focus:outline-none flex items-center justify-center
                    ${!selectedAddress ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  disabled={!selectedAddress}
                  title={!selectedAddress ? "Please select your location first" : ""}
                >
                  {selectedDate && selectedTime
                    ? `${selectedDate} at ${selectedTime}`
                    : "Choose Date & Time"}
                </button>
              </div> */}

              {selectedAddress && selectedProvider &&
                <>
                  <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                    <h3 className="text-base font-bold text-indigo-700 mb-3">Your Details</h3>

                    <div className="space-y-3">
                      <div>
                        <label htmlFor="fullName" className="block font-medium text-gray-700 mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200 text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-s font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(123) 456 7890"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200 text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="instructions" className="block text-s font-medium text-gray-700 mb-1">
                          Special Instructions{" "}
                          <span className="text-xs text-gray-500 font-normal">(optional)</span>
                        </label>
                        <textarea
                          id="instructions"
                          rows={3}
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          placeholder="Any special requests or details about your home?"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none transition duration-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                    <h3 className="text-base font-semibold text-indigo-700 mb-2 flex items-center">
                      <IndianRupee className="w-4 h-4 mr-2" />
                      Select Payment Method
                    </h3>
                    <div className="space-y-2">
                      {paymentOptions.map((method) => (
                        <label key={method.value} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={() => setPaymentMethod(method.value)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!selectedAddress || !selectedProvider || !fullName || !phone || !paymentMethod}
                      onClick={handlePayment}
                      className={`w-full bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg text-base hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition duration-300 shadow-md ${!selectedAddress || !selectedProvider || !fullName || !phone || !paymentMethod ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      Confirm Booking
                    </button>
                  </div>
                </>}
            </form>
          </div>
        </div>
      </main>

      <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
      <ProviderPopup setSelectedProvider={setSelectedProvider} providerPopup={providerPopup} selectedProvider={selectedProvider} setProviderPopup={setProviderPopup} serviceId={serviceId || ''} selectedTime={selectedTime} />
      <DateTimePopup dateTimePopup={dateTimePopup} setDateTimePopup={setDateTimePopup} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedTime={selectedTime} setSelectedTime={setSelectedTime} timeSlots={timeSlots} handleDateTimeConfirm={handleDateTimeConfirm} providersTimings={providerTimes} />
      <AddressPopup addressPopup={addressPopup} setAddressPopup={setAddressPopup} selectedAddress={selectedAddress} handleAddressConfirm={handleAddressConfirm} setShowAddAddress={setShowAddAddress} showAddAddress={showAddAddress} newAddress={newAddress} setNewAddress={setNewAddress} handleAddAddress={handleAddAddress} providerLoc={providersLocations} />
    </div>
  );
};

export default ServiceDetailsPage;
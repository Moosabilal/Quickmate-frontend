import React, { useEffect, useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { useNavigate, useParams } from 'react-router-dom';
import { ICategoryResponse } from '../../interface/ICategory';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { Star, MapPin, Clock, DollarSign, Phone, Mail, Award, X, Calendar } from 'lucide-react';
import ProviderPopup from './ProviderPopupPage';
import DateTimePopup from '../../components/user/DateTimePopup';
import AddressPopup from '../../components/user/AddressPopup';
import { IBackendProvider } from '../../interface/IProvider';
import { toast } from 'react-toastify';
import { bookingService } from '../../services/bookingService';
import { IProvider } from '../../interface/IProvider';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PaymentMethod, paymentVerificationRequest } from '../../interface/IPayment';
const paymentKey = import.meta.env.VITE_RAZORPAY_KEY_ID

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}
declare var Razorpay: any;




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
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');

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

  const handleAddAddress = () => {
    if (newAddress.label && newAddress.street && newAddress.city && newAddress.state && newAddress.zip) {
      const newAddressObj = {
        id: String(Date.now()),
        ...newAddress,
      };
      setSelectedAddress(newAddressObj);
      setShowAddAddress(false);
      setNewAddress({ label: '', street: '', city: '', state: '', zip: '' });
      setAddressPopup(false);
    }
  };

  const handleDateTimeConfirm = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setDateTimePopup(false);
  };

  const handleAddressConfirm = (address: Address) => {
    setSelectedAddress(address);
    setAddressPopup(false);
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute} ${period}`;
  });


  const handlePayment = async (e: React.FormEvent) => {

    e.preventDefault()
    const amount = selectedProvider?.price;
    const currency = "INR";
    const receipt = `receipt_${Date.now()}`

    const orderResponse = await bookingService.confirmPayment(Number(amount), currency, receipt)

    var options = {
      "key": paymentKey,
      amount: Number(amount) * 100,
      currency,
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
            paymentMethod: PaymentMethod.BANK,
            paymentDate: new Date(),
            amount: Number(amount),
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          };

          const validationRes = await bookingService.verifyPayment(paymentRequest);
          toast.success(`OrderId ${validationRes.orderId} ${validationRes.message}`);
          console.log('the booking result id', bookingRes.bookingId)
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
    rzp1.on('payment.failed', function (response) {
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
      const res = await bookingService.createBooking(bookingPayload);
      return res
      // // toast.success("Booking confirmed!");
      // navigate('/');
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
              <p className="text-2xl text-indigo-600 font-bold mb-6">Starting at $ 150</p>
              <p className="text-gray-700 leading-relaxed text-lg mb-8">
                {serviceDetails.description || 'No detailed description available.'}<br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-4xl font-extrabold text-indigo-800 mb-10 text-center">Book Your Service</h2>
            <form className="space-y-7">
              <div>
                <label htmlFor="dateTime" className="block text-base font-semibold text-gray-700 mb-2">
                  Select Date and Time
                </label>
                <button
                  type="button"
                  id="dateTime"
                  onClick={() => setDateTimePopup(true)}
                  className="w-full px-5 py-3 rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 transition duration-300 border border-indigo-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {selectedDate && selectedTime ? `${selectedDate} at ${selectedTime}` : 'Choose Date & Time'}
                </button>
              </div>

              <div>
                <label htmlFor="address" className="block text-base font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <button
                  type="button"
                  id="address"
                  onClick={() => setAddressPopup(true)}
                  className="w-full px-5 py-3 rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 transition duration-300 border border-indigo-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedAddress ? `${selectedAddress.label}: ${selectedAddress.street}, ${selectedAddress.city}` : 'Select Address'}
                </button>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-base font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200 text-lg"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-base font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(123) 456 7890"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200 text-lg"
                />
              </div>

              <div>
                <label htmlFor="instructions" className="block text-base font-semibold text-gray-700 mb-2">
                  Special Instructions <span className="text-sm text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  id="instructions"
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Any special requests or details about your home?"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none transition duration-200 text-lg"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Select Service Provider</label>
                <button
                  type="button"
                  onClick={() => setProviderPopup(true)}
                  className="w-full px-5 py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 shadow focus:outline-none text-lg flex items-center justify-center"
                >
                  <Award className="w-5 h-5 mr-2" />
                  {selectedProvider ? `Selected: ${selectedProvider.fullName}` : 'Choose Provider'}
                </button>
                {selectedProvider && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={getCloudinaryUrl(selectedProvider.profilePhoto)}
                        alt={selectedProvider.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{selectedProvider.fullName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>
                            {selectedProvider.rating} • ${selectedProvider.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={!selectedAddress || !selectedProvider}
                  className={`w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl text-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition duration-300 shadow-lg transform hover:-translate-y-1 ${!selectedAddress || !selectedProvider
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                    }`}
                  onClick={handlePayment}
                >
                  Confirm Booking
                </button>

              </div>
            </form>
          </div>
        </div>
      </main>
      <ProviderPopup setSelectedProvider={setSelectedProvider} providerPopup={providerPopup} selectedProvider={selectedProvider} setProviderPopup={setProviderPopup} serviceId={serviceId || ''} />
      <DateTimePopup dateTimePopup={dateTimePopup} setDateTimePopup={setDateTimePopup} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedTime={selectedTime} setSelectedTime={setSelectedTime} timeSlots={timeSlots} handleDateTimeConfirm={handleDateTimeConfirm} />
      <AddressPopup addressPopup={addressPopup} setAddressPopup={setAddressPopup} selectedAddress={selectedAddress} handleAddressConfirm={handleAddressConfirm} setShowAddAddress={setShowAddAddress} showAddAddress={showAddAddress} newAddress={newAddress} setNewAddress={setNewAddress} handleAddAddress={handleAddAddress} />
    </div>
  );
};

export default ServiceDetailsPage;
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService'; // 1. Use bookingService
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

// Make sure you have the Razorpay types or declare global
declare global {
    interface Window {
        Razorpay: any;
    }
}

const PaymentPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const orderId = searchParams.get('order_id');
    // Note: The session_id might not be needed for verification if we have all data in the order context
    // But if your backend requires it to find the pending booking data, keep it.
    const sessionId = searchParams.get('session_id'); 

    // 2. Use import.meta.env for Vite
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    useEffect(() => {
        if (!orderId) {
            toast.error('Invalid payment link');
            navigate('/');
            return;
        }

        loadRazorpayScript();
    }, [orderId]);

    const loadRazorpayScript = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            setLoading(false);
            // Automatically start payment when script loads
            // initPayment(); 
        };
        script.onerror = () => {
            toast.error('Failed to load payment gateway');
            setLoading(false);
        };
        document.body.appendChild(script);
    };

    const initPayment = async () => {
        if (!window.Razorpay) {
            toast.error("Razorpay SDK failed to load");
            return;
        }

        try {
            const options = {
                key: razorpayKey,
                // amount is handled by the order ID
                currency: 'INR',
                name: 'QuickMate',
                description: 'Service Booking Payment',
                order_id: orderId,
                handler: async function (response: any) {
                    await handlePaymentSuccess(response);
                },
                prefill: {
                    // Ideally, these should come from the URL params too if possible
                    // or you can leave them blank and let the user fill them in Razorpay
                    name: '',
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#3B82F6'
                },
                modal: {
                    ondismiss: function() {
                        toast.info('Payment cancelled');
                        // Optional: navigate home on cancel
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment initiation error:', error);
            toast.error('Failed to initiate payment');
        }
    };

    const handlePaymentSuccess = async (response: any) => {
        try {
            setLoading(true);
            
            // 3. Reconstruct the data your backend expects
            // Since this page is isolated, we might not have the full 'bookingData' object.
            // Your backend 'verifyChatPayment' expects 'bookingData'.
            
            // IMPORTANT: This "Link Flow" is tricky because the 'bookingData' is stored in the 
            // ChatSession context on the backend. Your backend needs a way to retrieve it 
            // using the 'sessionId'.
            
            // For now, I will assume you are sticking to the "In-Chat" flow (Flow 1) 
            // because it is much simpler and robust.
            
            // If you MUST support this page, you would need to:
            // A. Fetch the session context from backend using sessionId
            // B. Use that data to call verifyChatPayment
            
            // Since we don't have that endpoint ready, I will comment this out.
            // To make this page work, you would need to implement that fetch logic.
            
            toast.success('Payment successful! Please return to the chat window.');
            navigate('/'); // Redirect to home/chat

        } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                        Loading payment details...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Complete Your Payment
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Click the button below to proceed with payment.
                </p>
                <button
                    onClick={initPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                    Pay Now
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
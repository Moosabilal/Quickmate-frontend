import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, X, ChevronDown, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import type { ICategoryResponse, IserviceResponse } from '../../util/interface/ICategory';
import { authService } from '../../services/authService';
import type { IFeaturedProviders } from '../../util/interface/IProvider';
import ChatForm from '../../components/user/ChatForm';
import ChatMessage from '../../components/user/ChatMessage';
import { toast } from 'react-toastify';
import { ChatbotMessage } from '../../util/interface/IChatBot';
import { Testimonial, StarRatingProps } from '../../util/interface/IChatBot';
import { chatbotService } from '../../services/chatBotService';
import { AI_SYSTEM_PROMPT } from '../../util/AI_Prompt';
import { useAppSelector } from '../../hooks/useAppSelector';
import { isAxiosError } from 'axios';
import { RazorpayOptions, RazorpayPaymentFailedResponse, RazorpayResponse } from '../../util/interface/IRazorpay';

const testimonials: Testimonial[] = [
    {
        id: 1,
        author: 'Sarah F.',
        rating: 5,
        text: 'QuickMate made finding a reliable cleaner so easy! Jessica was efficient and amazing, my home has never looked better!',
    },
    {
        id: 2,
        author: 'David L.',
        rating: 5,
        text: 'Highly recommend! Peter was insightful in helping my Music Theory! He was professional and helped me grasp difficult concepts.',
    },
];

const paymentKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    const fullStars: number = Math.floor(rating);
    const hasHalfStar: boolean = rating % 1 !== 0;
    const emptyStars: number = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center" role="img" aria-label={`${rating} out of 5 stars`}>
            {[...Array(fullStars)].map((_, i) => (
                <svg
                    key={`full-${i}`}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
            ))}
            {hasHalfStar && (
                <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118L5.2 12.72a1 1 0 00-.364-1.118L2.03 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69L9.049 2.927zM12 15.5l-2.293-1.664a1 1 0 00-1.175 0L6.23 15.5 7.3 12.21a1 1 0 00-.364-1.118L4.13 9.052h3.462a1 1 0 00.95-.69L9.049 5.292 9.049 15.5z" />
                </svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <svg
                    key={`empty-${i}`}
                    className="w-4 h-4 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const Home: React.FC = () => {
    const [fetchedCategories, setFetchedCategories] = useState<ICategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [featuredProviders, setFeaturedProviders] = useState<IFeaturedProviders[]>([]);
    const [popularServices, setPopularServices] = useState<IserviceResponse[]>([]);
    const [trendingServices, setTrendingServices] = useState<IserviceResponse[]>([]);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatbotMessage[]>([{
        hideInChat: true,
        role: "model",
        text: AI_SYSTEM_PROMPT,
        timestamp: new Date(),
        id: 'system-prompt'
    }]);
    const [showChatbot, setShowChatbot] = useState<boolean>(false);

    const [isMinimized, setIsMinimized] = useState<boolean>(false);
    const [unreadCount, setUnreadCount] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; type: 'service' | 'provider'; image?: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const user = useAppSelector((state) => state.auth.user);

    const chatBodyRef = useRef<HTMLDivElement | null>(null);
    const lastMessageRef = useRef<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (showChatbot && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showChatbot, isMobile]);

    useEffect(() => {
        const loadHomePageData = async (): Promise<void> => {
            setIsLoading(true);
            setError(null);

            try {
                const [
                    categoriesResponse,
                    providersResponse,
                    popularResponse,
                    trendingResponse
                ] = await Promise.all([
                    categoryService.getTopLevelCategories(),
                    providerService.getFeaturedProviders(),
                    categoryService.getPopularServices(),
                    categoryService.getTrendingServices()
                ]);

                setFetchedCategories(categoriesResponse || []);
                setFeaturedProviders(providersResponse.providers || []);
                setPopularServices(popularResponse || []);
                setTrendingServices(trendingResponse || []);

            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError(err instanceof Error ? err.message : "Failed to load data.");
            } finally {
                setIsLoading(false);
            }
        };

        loadHomePageData();
    }, []);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTo({
                top: chatBodyRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [chatHistory]);

    useEffect(() => {
        const lastMessage = chatHistory[chatHistory.length - 1];
        if (lastMessage && lastMessage.role === 'model' && !showChatbot && lastMessage.text !== lastMessageRef.current) {
            setUnreadCount(prev => prev + 1);
            lastMessageRef.current = lastMessage.text;
        }
    }, [chatHistory, showChatbot]);

    useEffect(() => {
        if (showChatbot) {
            setUnreadCount(0);
        }
    }, [showChatbot]);

    useEffect(() => {
        const initChat = async () => {
            try {
                const sId = await chatbotService.startOrGetSession(user?.id);
                setSessionId(sId);
                const history = await chatbotService.getHistory(sId);
                setChatHistory(history);
            } catch (error) {
                console.log('connection to chatbot : ', error)
                toast.error("Could not connect to chatbot.");
            }
        };
        initChat();
    }, [user?.id]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    const response = await authService.searchResources(searchQuery);
                    console.log('the response', response)
                    const serviceSuggestions = response.services.map((s: any) => ({
                        id: s._id || s.id,
                        name: s.title || s.name,
                        type: 'service',
                        image: s.iconUrl
                    }));
                    const providerSuggestions = response.providers.map((p: any) => ({
                        id: p._id || p.id,
                        name: p.fullName || p.name,
                        type: 'provider',
                        image: p.profilePicture
                    }));
                    setSuggestions([...serviceSuggestions, ...providerSuggestions]);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error(error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSuggestionClick = useCallback((suggestion: { id: string, type: string }) => {
        if (suggestion.type === 'service') {
            navigate(`/service-detailsPage/${suggestion.id}`);
        } else {
            navigate(`/providers/${suggestion.id}`);
        }
        setShowSuggestions(false);
    }, [navigate]);

    const generateBotResponse = useCallback(async (history: ChatbotMessage[]): Promise<void> => {
        if (!sessionId) {
            toast.error("Chat session not initialized.");
            return;
        }

        const userMessage = history[history.length - 1].text;

        try {
            const botResponse = await chatbotService.sendMessage(sessionId, userMessage);

            console.log('the bot response in frontend', botResponse)

            setChatHistory(prev => [
                ...prev,
                { ...botResponse, timestamp: new Date(), id: Date.now().toString() }
            ]);

            if (botResponse.action === 'REQUIRE_PAYMENT' && botResponse.payload) {
                const { orderId, amount, bookingData } = botResponse.payload;
                console.log('the return booking data', orderId, amount, bookingData)
                
                const options: RazorpayOptions = {
                    key: paymentKey,
                    amount: amount * 100,
                    currency: "INR",
                    name: "QuickMate Booking",
                    description: `Booking for ${bookingData.serviceId}`,
                    order_id: orderId,

                    handler: async (response: RazorpayResponse) => {
                        try {

                            const verifyData = {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingData: bookingData
                            };

                            const resData = await chatbotService.verifyChatPayment(sessionId, verifyData);

                            console.log('the chatpayment restult', resData)

                            const successMsg = `✅ Payment successful! Your booking (ID: ${resData.booking._id}) is confirmed. Redirecting you now...`;
                            setChatHistory(prev => [
                                ...prev,
                                { role: 'model', text: successMsg, timestamp: new Date(), id: Date.now().toString() }
                            ]);

                            setTimeout(() => {
                                navigate(`/confirmationModel/${resData.booking._id}`);
                            }, 2000);

                        } catch (err) {
                            console.error(err);
                            toast.error("Payment verification failed. Please contact support.");
                        }
                    },

                    prefill: {
                        name: user?.name || bookingData.customerName,
                        email: user?.email || "",
                        contact: bookingData.phone,
                    },
                    theme: { color: "#3057b0ff" },

                    modal: {
                        ondismiss: () => {
                            toast.info("Payment cancelled.");
                        }
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response: RazorpayPaymentFailedResponse) {
                    toast.error(response.error.description || "Payment failed");
                });
                rzp1.open();
            }
        } catch (error) {
            let errorMessage = "Sorry, I'm having trouble connecting.";
            if (isAxiosError(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setChatHistory(prev => [
                ...prev,
                { role: 'model', text: errorMessage, isError: true, timestamp: new Date(), id: Date.now().toString() }
            ]);
        }
    }, [sessionId, user, navigate]);

    const handleOptionClick = useCallback((text: string) => {
        console.log('the option click text', text)
        if (text === "NAVIGATE_PROFILE_ADDRESS") {
            navigate('/profile');
            return;
        }

        const userMessage: ChatbotMessage = {
            role: 'user',
            text: text,
            timestamp: new Date(),
            id: Date.now().toString()
        };

        setChatHistory(prev => [...prev, userMessage]);

        setTimeout(() => {
            generateBotResponse([...chatHistory, userMessage]);
        }, 0);

    }, [generateBotResponse, chatHistory, navigate]);

    const toggleChatbot = useCallback((): void => {
        setShowChatbot(prev => !prev);
        if (isMinimized) setIsMinimized(false);
    }, [isMinimized]);

    const minimizeChatbot = useCallback((): void => {
        setIsMinimized(prev => !prev);
    }, []);


    const handleSearchSubmit = useCallback((e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (suggestions.length > 0) {
            handleSuggestionClick(suggestions[0]);
        } else if (searchQuery.trim()) {
            toast.info(`No matching services found for: ${searchQuery}`);
        }
    }, [searchQuery, suggestions, handleSuggestionClick]);

    const handleRetry = useCallback((): void => {
        window.location.reload();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" role="status" aria-label="Loading"></div>
                <p className="ml-4 text-xl">Loading services...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-red-500">
                <p className="text-xl">Error: {error}</p>
                <button
                    onClick={handleRetry}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">

            <main>
                <section
                    className="relative bg-cover bg-no-repeat bg-center h-[500px] md:h-[650px] lg:h-screen flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/landingPageImage.png')" }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                    <div className="relative z-10 text-center px-4 sm:px-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                            Find local services for <span className="text-emerald-300">almost anything</span>
                        </h1>
                        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Connect with trusted professionals for your everyday needs.
                        </p>

                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto"
                        >
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="What service are you looking for?"
                                    className="p-3 rounded-lg w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 outline-none transition-shadow"
                                    aria-label="Search for services"
                                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-xl rounded-b-lg z-50 mt-1 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 text-left">
                                        {suggestions.map((suggestion) => (
                                            <div
                                                key={`${suggestion.type}-${suggestion.id}`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                            >
                                                <img
                                                    src={suggestion.image! || './home_search_backup_img.webp'}
                                                    alt={suggestion.name}
                                                    className="w-10 h-10 rounded-full object-cover mr-3"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{suggestion.name}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{suggestion.type}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 whitespace-nowrap"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
                        Browse by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                        {fetchedCategories
                            .filter(category => category.status)
                            .slice(0, 4)
                            .map((category) => (
                                <Link
                                    to={`/booking_serviceList/${category.id}`}
                                    key={category.id}
                                    className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                                        <img
                                            src={category.iconUrl || 'https://via.placeholder.com/64?text=Category'}
                                            alt={`${category.name} category icon`}
                                            className="rounded-full w-24 h-24 object-cover"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center">
                                        {category.name}
                                    </h3>
                                </Link>
                            ))}
                    </div>
                </section>

                <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
                            Popular Services Near You
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            {popularServices.map((service) => (
                                <Link
                                    to={`/service-detailsPage/${service.id}`}
                                    key={service.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <img
                                        src={service.iconUrl ? service.iconUrl : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi7Z6nS0paslUx7X-rSOyNqmhge_ugyoMcFA&s'}
                                        alt={`${service.name} service`}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-5">
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                            {service.name}
                                        </h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold line-clamp-2">
                                            {service.description || 'Service Details'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            {popularServices.length === 0 && (
                                <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">
                                    No popular services found.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
                            Trending in Your Area
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                            {trendingServices.map((service) => (
                                <Link
                                    to={`/service-detailsPage/${service.id}`}
                                    key={service.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <img
                                        src={service.iconUrl ? service.iconUrl : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi7Z6nS0paslUx7X-rSOyNqmhge_ugyoMcFA&s'}
                                        alt={`${service.name} service`}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-5">
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                            {service.name}
                                        </h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold line-clamp-2">
                                            {service.description || 'Service Details'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            {trendingServices.length === 0 && (
                                <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">
                                    No trending services found.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
                            Featured Providers
                        </h2>
                        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                            <div className="flex space-x-6">
                                {featuredProviders.map((provider) => (
                                    <Link
                                        to={`/providers/${provider.id}`}
                                        key={provider.id}
                                        className="flex-shrink-0 w-48 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center hover:shadow-lg transition duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <img
                                            src={provider.profilePhoto}
                                            alt={`${provider.fullName} profile`}
                                            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                                        />
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
                                            {provider.fullName}
                                        </h3>
                                        <div className="flex justify-center">
                                            <StarRating rating={provider.rating} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
                        What People Are Saying
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {testimonials.map((testimonial) => (
                            <article
                                key={testimonial.id}
                                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border-t-4 border-blue-500 dark:border-blue-400"
                            >
                                <StarRating rating={testimonial.rating} />
                                <blockquote className="text-gray-700 dark:text-gray-300 mt-4 italic">
                                    "{testimonial.text}"
                                </blockquote>
                                <cite className="font-semibold text-gray-800 dark:text-gray-100 mt-4 not-italic block">
                                    - {testimonial.author}
                                </cite>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
                    <div className="container mx-auto flex flex-col md:flex-row items-center gap-10">
                        <div className="md:w-1/2">
                            <img
                                src="/booking_image.png"
                                alt="How QuickMate Works illustration"
                                className="rounded-lg shadow-lg w-full max-h-96 object-cover"
                            />
                        </div>
                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                                How It Works
                            </h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                QuickMate connects you with skilled local professionals for all your needs.
                                Simply search for the service you need, browse through profiles and reviews,
                                book your service, and get things done! It's that easy.
                            </p>
                            <Link
                                to="/working"
                                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Learn More
                                <svg
                                    className="ml-2 w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                        Join QuickMate today and simplify your life!
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        Sign Up Now - It's Free!
                        <svg
                            className="ml-3 w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </section>

                <div className={`fixed ${isMobile && showChatbot ? 'inset-0' : 'bottom-6 right-6'} z-50 ${showChatbot && isMobile ? 'chatbot-mobile-fullscreen' : ''}`}>
                    {showChatbot && isMobile && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
                    )}

                    <button
                        onClick={toggleChatbot}
                        className={`${isMobile && showChatbot ? 'hidden' : 'block'} w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group ${showChatbot ? 'rotate-180' : 'rotate-0'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        aria-label={showChatbot ? "Close chat" : "Open chat"}
                    >
                        {showChatbot ? (
                            <X className="w-6 h-6 transition-transform duration-300" />
                        ) : (
                            <MessageSquare className="w-6 h-6 transition-transform duration-300" />
                        )}

                        {!showChatbot && unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                <span className="text-xs text-white font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            </div>
                        )}
                    </button>

                    <div className={`${isMobile && showChatbot
                        ? 'fixed inset-4 flex flex-col z-10'
                        : `absolute ${isMobile ? 'bottom-16 right-0' : 'bottom-16 right-0'} w-80 sm:w-96 max-w-[calc(100vw-3rem)]`
                        } transition-all duration-300 transform ${showChatbot ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
                        }`}>
                        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm ${isMobile && showChatbot ? 'h-full flex flex-col' : ''
                            }`}>
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">AI Assistant</h3>
                                        <div className="flex items-center gap-1 text-white/80 text-xs">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span>Online</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!isMobile && (
                                        <button
                                            onClick={minimizeChatbot}
                                            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                                            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
                                        >
                                            {isMinimized ? (
                                                <Maximize2 className="w-4 h-4 text-white" />
                                            ) : (
                                                <Minimize2 className="w-4 h-4 text-white" />
                                            )}
                                        </button>
                                    )}
                                    <button
                                        onClick={toggleChatbot}
                                        className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                                        aria-label="Close chat"
                                    >
                                        {isMobile ? (
                                            <X className="w-4 h-4 text-white" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-white" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {!isMinimized && (
                                <>
                                    <div
                                        ref={chatBodyRef}
                                        className={`${isMobile && showChatbot ? 'flex-1' : 'h-80 sm:h-96'} overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent`}
                                        role="log"
                                        aria-label="Chat messages"
                                        aria-live="polite"
                                    >
                                        <div className="flex gap-3 mb-4 animate-fadeInUp">
                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="max-w-[280px] px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-md shadow-sm">
                                                <p className="text-sm leading-relaxed">
                                                    👋 Hey there! <br />
                                                    How can I help you today?
                                                </p>
                                            </div>
                                        </div>

                                        {chatHistory.map((chat, index) => (
                                            <ChatMessage key={chat.id || `message-${index}`} chat={chat} onOptionClick={handleOptionClick} />
                                        ))}
                                    </div>

                                    <div className="p-4  border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                                        <ChatForm
                                            chatHistory={chatHistory}
                                            setChatHistory={setChatHistory}
                                            generateBotResponse={generateBotResponse}
                                        />

                                        <div className="text-center mt-2">
                                            <span className="text-xs text-gray-400">Powered by QuickMate</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
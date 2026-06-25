import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
import { StarRatingProps } from '../../util/interface/IChatBot';
import { chatbotService } from '../../services/chatBotService';
import { AI_SYSTEM_PROMPT } from '../../util/AI_Prompt';
import { useAppSelector } from '../../hooks/useAppSelector';
import { isAxiosError } from 'axios';
import { RazorpayOptions, RazorpayPaymentFailedResponse, RazorpayResponse } from '../../util/interface/IRazorpay';
import { Provider, Service, Suggestion } from '../../util/interface/IUser';

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
                    className="w-4 h-4 text-amber-400 drop-shadow-sm"
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
                    className="w-4 h-4 text-amber-400 drop-shadow-sm"
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
                    className="w-4 h-4 text-slate-300"
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
    const { scrollY } = useScroll();
    const heroBgY = useTransform(scrollY, [0, 1000], [0, 300]);

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

    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

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
                    const serviceSuggestions: Suggestion[] = response.services.map((s: Service) => ({
                        id: s._id || s.id,
                        name: s.title || s.name,
                        type: 'service',
                        image: s.iconUrl
                    }));
                    const providerSuggestions: Suggestion[] = response.providers.map((p: Provider) => ({
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
        <div className="bg-transparent dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-500">

            <main>
                <section className="relative h-[500px] md:h-[650px] lg:h-screen flex items-center justify-center text-white overflow-hidden">
                    <motion.div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/landingPageImage.png')", y: heroBgY }}
                    />
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent dark:from-black/90 dark:via-black/60 dark:to-transparent"></div>

                    <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-4xl mx-auto pt-16">
                        <motion.h1 
                            className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight flex flex-wrap justify-center gap-x-3 gap-y-1"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                            }}
                        >
                            {"Find local services for".split(" ").map((word, i) => (
                                <motion.span key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                    {word}
                                </motion.span>
                            ))}
                            <motion.span 
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} 
                                className="text-emerald-400 inline-block drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                            >
                                almost anything
                            </motion.span>
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto text-gray-200 font-light"
                        >
                            Connect with trusted professionals for your everyday needs.
                        </motion.p>

                        <motion.form
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1, duration: 0.8, type: "spring" }}
                            onSubmit={handleSearchSubmit}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-3xl mx-auto"
                        >
                            <div className="relative w-full group flex-1">
                                <motion.div 
                                    className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="What service are you looking for?"
                                    className="relative p-4 sm:p-5 rounded-2xl w-full bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-white/20 text-white placeholder-white/70 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-base sm:text-lg focus:scale-[1.02]"
                                    aria-label="Search for services"
                                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-full left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl rounded-2xl z-50 mt-2 max-h-60 overflow-y-auto border border-white/20 dark:border-gray-700/50 text-left p-2"
                                    >
                                        {suggestions.map((suggestion) => (
                                            <div
                                                key={`${suggestion.type}-${suggestion.id}`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="flex items-center p-3 hover:bg-emerald-50 dark:hover:bg-gray-700/50 rounded-xl cursor-pointer transition-colors"
                                            >
                                                <img
                                                    src={suggestion.image! || './home_search_backup_img.webp'}
                                                    alt={suggestion.name}
                                                    className="w-10 h-10 rounded-full object-cover mr-3 shadow-sm"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{suggestion.name}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{suggestion.type}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 whitespace-nowrap text-lg"
                            >
                                Search
                            </button>
                        </motion.form>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16 md:py-24">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-gray-800 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400"
                    >
                        Browse by Category
                    </motion.h2>
                    <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 gap-6 sm:gap-8 scrollbar-hide snap-x">
                        {fetchedCategories
                            .filter(category => category.status)
                            .slice(0, 4)
                            .map((category, index) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
                                    className="snap-center shrink-0 w-[240px] sm:w-[280px]"
                                >
                                    <motion.div 
                                        whileHover={{ y: -5 }} 
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Link
                                            to={`/booking_serviceList/${category.id}`}
                                            className="relative block group rounded-[1.5rem] overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none transition-shadow duration-500 border border-white/60 dark:border-white/10 focus:outline-none h-64 w-full"
                                        >
                                            <img
                                                src={category.iconUrl || 'https://via.placeholder.com/64?text=Category'}
                                                alt={`${category.name} category icon`}
                                                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out z-0"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10 pointer-events-none"></div>
                                            <div className="absolute bottom-0 left-0 w-full p-5 z-20">
                                                <h3 className="text-xl font-bold text-white text-left tracking-tight">
                                                    {category.name}
                                                </h3>
                                                {category.description && (
                                                    <p className="text-slate-200 font-medium line-clamp-2 text-sm mt-1 tracking-tight">
                                                        {category.description}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            ))}
                    </div>
                </section>

                <section className="bg-transparent px-4 py-16 md:py-24 relative">
                    <div className="absolute inset-0 bg-blue-50/50 dark:bg-gray-900/50 backdrop-blur-3xl -z-10 skew-y-2 transform origin-top-left"></div>
                    <div className="container mx-auto relative z-10">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-gray-800 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400"
                        >
                            Popular Services Near You
                        </motion.h2>
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                            }}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8"
                        >
                            {popularServices.map((service) => (
                                <motion.div key={service.id} variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } } }}>
                                    <Link
                                        to={`/service-detailsPage/${service.id}`}
                                        className="relative block group rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 h-full transform hover:-translate-y-2 hover:shadow-2xl"
                                    >
                                        <div className="absolute inset-0 rounded-[2rem] border border-white/40 dark:border-white/10 pointer-events-none z-20"></div>
                                        <div className="relative overflow-hidden aspect-[4/5] bg-gray-200 dark:bg-gray-800 h-full">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity z-10 duration-500"></div>
                                            <img
                                                src={service.iconUrl ? service.iconUrl : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi7Z6nS0paslUx7X-rSOyNqmhge_ugyoMcFA&s'}
                                                alt={`${service.name} service`}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 p-5 z-20 bg-white/30 dark:bg-black/40 backdrop-blur-md border-t border-white/20 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-300 dark:group-hover:text-indigo-400 transition-colors tracking-tight drop-shadow-md">
                                                    {service.name}
                                                </h3>
                                                <p className="text-indigo-100 dark:text-indigo-200 font-semibold line-clamp-2 text-sm tracking-tight drop-shadow-md">
                                                    {service.description || 'Premium Service'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                            {popularServices.length === 0 && (
                                <p className="text-center text-gray-600 dark:text-gray-400 col-span-full py-8">
                                    No popular services found.
                                </p>
                            )}
                        </motion.div>
                    </div>
                </section>

                <section className="bg-transparent px-4 py-16 md:py-24">
                    <div className="container mx-auto">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-gray-800 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400"
                        >
                            Trending in Your Area
                        </motion.h2>
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                            }}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8"
                        >
                            {trendingServices.map((service) => (
                                <motion.div key={service.id} variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } } }}>
                                    <Link
                                        to={`/service-detailsPage/${service.id}`}
                                        className="relative block group rounded-[1.5rem] overflow-hidden shadow-lg shadow-slate-200/40 dark:shadow-none transition-all duration-500 h-full transform hover:-translate-y-2 hover:shadow-xl"
                                    >
                                        <div className="absolute inset-0 rounded-[1.5rem] border border-white/40 dark:border-white/10 pointer-events-none z-20"></div>
                                        <div className="relative overflow-hidden aspect-square bg-gray-200 dark:bg-gray-800 h-full">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity z-10 duration-500"></div>
                                            <img
                                                src={service.iconUrl ? service.iconUrl : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi7Z6nS0paslUx7X-rSOyNqmhge_ugyoMcFA&s'}
                                                alt={`${service.name} service`}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-white/30 dark:bg-black/40 backdrop-blur-md border-t border-white/20 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-300 dark:group-hover:text-indigo-400 transition-colors tracking-tight drop-shadow-md">
                                                    {service.name}
                                                </h3>
                                                <p className="text-indigo-100 dark:text-indigo-200 font-semibold line-clamp-2 text-xs tracking-tight drop-shadow-md">
                                                    {service.description || 'Premium Service'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                            {trendingServices.length === 0 && (
                                <p className="text-center text-gray-600 dark:text-gray-400 col-span-full py-8">
                                    No trending services found.
                                </p>
                            )}
                        </motion.div>
                    </div>
                </section>

                <section className="bg-transparent px-4 py-16 md:py-24 relative overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    
                    <div className="container mx-auto relative z-10">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-gray-800 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400"
                        >
                            Featured Providers
                        </motion.h2>
                        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x">
                            <motion.div 
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                                }}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="flex space-x-6 sm:space-x-8"
                            >
                                {featuredProviders.map((provider) => (
                                    <motion.div 
                                        key={provider.id} 
                                        variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.5 } } }} 
                                        className="snap-center py-6 px-2"
                                        whileHover={{ y: -8, scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <Link
                                            to={`/providers/${provider.id}`}
                                            className="flex flex-col items-center justify-center w-56 sm:w-64 p-6 rounded-[2rem] bg-[#DDECED] hover:brightness-95 dark:bg-gray-800/80 dark:hover:bg-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgb(0,0,0,0.1)] dark:shadow-none transition-all duration-300 group focus:outline-none block border border-white/40 dark:border-white/10"
                                        >
                                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4">
                                                <img
                                                    src={provider.profilePhoto}
                                                    alt={`${provider.fullName} profile`}
                                                    className="w-full h-full rounded-full object-cover shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-shadow duration-300 ring-4 ring-white/30"
                                                />
                                                <div className="absolute bottom-1 right-1 w-6 h-6 sm:w-7 sm:h-7 bg-indigo-600 rounded-full ring-4 ring-[#DDECED] dark:ring-gray-800 flex items-center justify-center shadow-md transition-colors duration-300 group-hover:ring-[#d2e4e5]">
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-extrabold text-slate-800 dark:text-gray-100 tracking-tight mt-4 capitalize group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                {provider.fullName}
                                            </h3>
                                            <div className="flex justify-center mt-2 scale-110 drop-shadow-[0_2px_4px_rgba(250,204,21,0.4)]">
                                                <StarRating rating={provider.rating} />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="px-4 py-16 md:py-24 overflow-hidden bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                    <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="md:w-1/2"
                        >
                            <div className="relative rounded-3xl p-2 bg-gradient-to-br from-blue-400 to-emerald-400 shadow-[0_20px_50px_rgba(8,112,184,0.2)]">
                                <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-3xl opacity-50 backdrop-blur-xl"></div>
                                <img
                                    src="/booking_image.png"
                                    alt="How QuickMate Works illustration"
                                    className="relative rounded-[1.25rem] shadow-lg w-full max-h-[500px] object-cover"
                                />
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
                            className="md:w-1/2 text-center md:text-left"
                        >
                            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400">
                                How It Works
                            </h2>
                            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 opacity-90 font-light">
                                QuickMate connects you with skilled local professionals for all your needs.
                                Simply search for the service you need, browse through profiles and reviews,
                                book your service, and get things done! It's that easy.
                            </p>
                            <Link
                                to="/working"
                                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Learn More
                                <svg
                                    className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                { !isAuthenticated && (<section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-700 flex items-center justify-center isolate">
                    {/* Abstract Floating Shapes for CTA */}
                    <motion.div 
                        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} 
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
                        className="absolute top-10 left-10 w-32 h-32 bg-white/10 backdrop-blur-md rounded-full -z-10"
                    />
                    <motion.div 
                        animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }} 
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
                        className="absolute bottom-10 right-20 w-48 h-48 bg-white/10 backdrop-blur-md rounded-full -z-10"
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }} 
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 blur-[100px] rounded-full -z-10"
                    />

                    <div className="container mx-auto px-4 text-center z-10 relative">
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md"
                        >
                            Ready to Get Started?
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-emerald-50 mb-10 font-light max-w-2xl mx-auto"
                        >
                            Join QuickMate today and simplify your life!
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, type: "spring" }}
                        >
                            <Link
                                to="/register"
                                className="inline-flex items-center bg-white text-emerald-600 hover:text-emerald-700 font-bold py-5 px-12 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] transform hover:scale-105 transition-all duration-300 text-lg group"
                            >
                                Sign Up Now - It's Free!
                                <svg
                                    className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </motion.div>
                    </div>
                </section>)}

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
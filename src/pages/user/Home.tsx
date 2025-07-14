import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../components/user/Header';
import { categoryService } from '../../services/categoryService'; 
import { ICategoryResponse } from '../../types/category'; 

const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                </svg>
            ))}
            {hasHalfStar && (
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118L5.2 12.72a1 1 0 00-.364-1.118L2.03 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69L9.049 2.927zM12 15.5l-2.293-1.664a1 1 0 00-1.175 0L6.23 15.5 7.3 12.21a1 1 0 00-.364-1.118L4.13 9.052h3.462a1 1 0 00.95-.69L9.049 5.292 9.049 15.5z"></path>
                </svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                </svg>
            ))}
        </div>
    );
};

const featuredProviders = [
    { id: 1, name: 'Olivia R.', rating: 5, imageUrl: 'https://tse4.mm.bing.net/th?id=OIP.Mvcr0QDsGXOx29cSBfXd6AHaE7&pid=Api&P=0&h=180?text=OR' },
    { id: 2, name: 'Marcus P.', rating: 4.8, imageUrl: 'https://via.placeholder.com/64/34d399/ffffff?text=MP' },
    { id: 3, name: 'Emily C.', rating: 4.9, imageUrl: 'https://via.placeholder.com/64/facc15/ffffff?text=EC' },
    { id: 4, name: 'Jonathan S.', rating: 5, imageUrl: 'https://via.placeholder.com/64/fb7185/ffffff?text=JS' },
];

const testimonials = [
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

const Home = () => {
    const navigate = useNavigate();

    const [fetchedCategories, setFetchedCategories] = useState<ICategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [popularServices, setPopularServices] = useState<ICategoryResponse[]>([]);
    const [trendingServices, setTrendingServices] = useState<ICategoryResponse[]>([]);


    useEffect(() => {
        const loadCategories = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await categoryService.getAllCategories();
                if(!response){
                    console.log('error in respoinse')
                }
                setFetchedCategories(response);

                const allSubCategories: ICategoryResponse[] = [];
                response.forEach(cat => {
                    if (cat.subCategories && cat.subCategories.length > 0) {
                        const activeSubCategories = cat.subCategories.filter(sub => sub.status === true);
                        allSubCategories.push(...activeSubCategories);
                    }
                });

                const lifoSubCategories = [...allSubCategories].reverse();

                const numPopular = 5; 
                const numTrending = 6; 

                setPopularServices(lifoSubCategories.slice(0, numPopular));
                setTrendingServices(lifoSubCategories.slice(numPopular, numPopular + numTrending));

            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setError("Failed to load categories. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
    }, []);
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <p className="ml-4 text-xl">Loading services...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-red-500">
                <p className="text-xl">Error: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            <Header />

            <main className="pt-20"> 
                <section
                    className="relative bg-cover bg-center h-[500px] md:h-[600px] flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
                >
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative z-10 text-center px-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
                            Find local services for <span className="text-emerald-300">almost anything</span>
                        </h1>
                        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Connect with trusted professionals for your everyday needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <input
                                type="text"
                                placeholder="What service are you looking for?"
                                className="p-3 rounded-lg w-full sm:w-80 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                            {/* <input
                                type="text"
                                placeholder="Your Location (e.g., Delhi, Mumbai)"
                                className="p-3 rounded-lg w-full sm:w-64 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            /> */}
                            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200">
                                Search
                            </button>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Browse by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                        {fetchedCategories.filter(category => category.status).slice(0,4).map((category) => (
                            <Link to={`/category/${category._id}`} key={category._id} className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:-translate-y-1">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                                    <img src={category.iconUrl || 'https://via.placeholder.com/64?text=Category'} alt={category.name} className='rounded-full w-24 h-24 object-cover' />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center">{category.name}</h3>
                            </Link>
                            
                        ))}
                    </div>
                </section>

                <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Popular Services Near You</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            {popularServices.map((service) => (
                                <Link to={`/service/${service._id}`} key={service._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 transform hover:-translate-y-1">
                                    <img src={service.iconUrl || 'https://via.placeholder.com/150?text=Service'} alt={service.name} className="w-full h-48 object-cover" />
                                    <div className="p-5">
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{service.name}</h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold">{service.description || 'Service Details'}</p>
                                    </div>
                                </Link>
                            ))}
                            {popularServices.length === 0 && !isLoading && (
                                <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">No popular services found.</p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Trending in Your Area</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                            {trendingServices.map((service) => (
                                <Link to={`/service/${service._id}`} key={service._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 transform hover:-translate-y-1">
                                    <img src={service.iconUrl || 'https://via.placeholder.com/150?text=Service'} alt={service.name} className="w-full h-48 object-cover" />
                                    <div className="p-5">
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{service.name}</h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold">{service.description || 'Service Details'}</p>
                                    </div>
                                </Link>
                            ))}
                            {popularServices.length === 0 && !isLoading && (
                                <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">No trending services found.</p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Featured Providers</h2>
                        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                            <div className="flex space-x-6">
                                {featuredProviders.map((provider) => (
                                    <Link to={`/provider/${provider.id}`} key={provider.id} className="flex-shrink-0 w-48 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center hover:shadow-lg transition duration-200 transform hover:-translate-y-1">
                                        <img src={provider.imageUrl} alt={provider.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{provider.name}</h3>
                                        <StarRating rating={provider.rating} />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{provider.rating} Stars</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">What People Are Saying</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border-t-4 border-blue-500 dark:border-blue-400">
                                <StarRating rating={testimonial.rating} />
                                <p className="text-gray-700 dark:text-gray-300 mt-4 italic">"{testimonial.text}"</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-100 mt-4">- {testimonial.author}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
                    <div className="container mx-auto flex flex-col md:flex-row items-center gap-10">
                        <div className="md:w-1/2">
                            <img src="/images/how-it-works.png" alt="How QuickMate Works" className="rounded-lg shadow-lg w-full h-auto object-cover" />
                        </div>
                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">How It Works</h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                QuickMate connects you with skilled local professionals for all your needs. Simply search for the service you need, browse through profiles and reviews, book your service, and get things done! It's that easy.
                            </p>
                            <Link to="/how-it-works" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
                                Learn More
                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">Ready to Get Started?</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                        Join QuickMate today and simplify your life!
                    </p>
                    <Link to="/register" className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
                        Sign Up Now - It's Free!
                        <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </Link>
                </section>
            </main>

            <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 dark:text-gray-400 py-8">
                <div className="container mx-auto px-4 text-center text-sm">
                    <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-8 mb-4">
                        <Link to="/contact" className="hover:text-white">Contact</Link>
                        <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} QuickMate. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, BarChart2, Briefcase } from 'lucide-react';
import { providerService } from '../../services/providerService';
import { RatingTrendChart } from '../../components/provider/RatingTrendChart'; 
import { getCloudinaryUrl } from '../../util/cloudinary';
import { IProviderPerformance, } from '../../util/interface/IProvider';

const PerformanceDashboard = () => {
    const [performanceData, setPerformanceData] = useState<IProviderPerformance | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                setIsLoading(true);
                const response = await providerService.getProviderPerformance();
                if (response && response.data) {
                    setPerformanceData(response.data);
                } else {
                    throw new Error("Performance data not found in response.");
                }
            } catch (err) {
                console.error("Failed to fetch performance data:", err);
                setError("Could not load performance data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPerformance();
    }, []);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
                    />
                ))}
            </div>
        );
    };
    
    const serviceColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-green-500 to-emerald-500'];
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 transition-colors duration-300">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !performanceData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-900 text-red-500 dark:text-red-400 transition-colors duration-300">
                {error || "No performance data available."}
            </div>
        );
    }
    
    const latestTrendValue = performanceData.starRatingTrend.length > 0 ? performanceData.starRatingTrend[performanceData.starRatingTrend.length - 1].value : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <main className="flex-1 p-4 md:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Welcome back, {performanceData.providerName}!</p>
                    </div>

                    {/* Stats Grid - Adjusted to be 2 columns on mobile */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors hover:shadow-md">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded-lg flex items-center justify-center shrink-0">
                                    <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{performanceData.avgRating.toFixed(1)}</p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors hover:shadow-md">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-lg flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{performanceData.completionRate}</p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors hover:shadow-md">
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Jobs Completed</p>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{performanceData.completedBookings}</p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors hover:shadow-md">
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 rounded-lg flex items-center justify-center shrink-0">
                                    <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{performanceData.totalBookings}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Star Rating Trends</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Last {performanceData.starRatingTrend.length} Months</p>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                    {latestTrendValue.toFixed(1)} <span className='text-xl text-amber-400'>★</span>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <RatingTrendChart data={performanceData.starRatingTrend} />
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                             <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Completion by Service</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Overall performance</p>
                            </div>
                            <div className="space-y-6">
                                {performanceData.serviceBreakdown.map((service, index) => (
                                    <div key={service.serviceName}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{service.serviceName}</span>
                                            <span className="text-sm font-bold text-gray-800 dark:text-white">{service.completionRate}%</span>
                                        </div>
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                            <div className={`h-full bg-gradient-to-r ${serviceColors[index % serviceColors.length]}`} style={{ width: `${service.completionRate}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Reviews Section */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Customer Reviews & Ratings</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Rating Breakdown */}
                            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                                <div className="text-center mb-6">
                                    <p className="text-5xl font-bold text-gray-900 dark:text-white">{performanceData.avgRating.toFixed(1)}</p>
                                    <div className="flex justify-center my-2">{renderStars(performanceData.avgRating)}</div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Based on {performanceData.reviews.length} reviews</p>
                                </div>
                                <div className="space-y-3">
                                    {performanceData.ratingDistribution.map((rating) => (
                                        <div key={rating.stars} className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-12">{rating.stars} star</span>
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${rating.percentage}%` }}></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-10 text-right">{rating.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="lg:col-span-2 space-y-4">
                                {performanceData.reviews.map((review, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <img 
                                                src={review.avatar ? getCloudinaryUrl(review.avatar) : '/profileImage.png'} 
                                                alt={`${review.name}'s avatar`} 
                                                className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-600 border border-gray-100 dark:border-gray-600" 
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-1">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{review.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{review.time}</p>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed break-words">{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
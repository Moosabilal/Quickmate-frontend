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
    console.log('the performance data', performanceData)

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
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
            </div>
        );
    };
    
    const serviceColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-green-500 to-emerald-500'];
    
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-gray-600">Loading Dashboard...</div>;
    }

    if (error || !performanceData) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-red-500">{error || "No performance data available."}</div>;
    }
    
    const latestTrendValue = performanceData.starRatingTrend.length > 0 ? performanceData.starRatingTrend[performanceData.starRatingTrend.length - 1].value : 0;

    return (
        <div className="min-h-screen bg-slate-50 text-gray-800">
            <div className="max-w-7xl mx-auto">
                <main className="flex-1 p-4 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Performance Dashboard</h1>
                        <p className="text-base text-gray-500 mt-1">Welcome back, {performanceData.providerName}!</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                                <div className="w-10 h-10 bg-amber-100 text-amber-500 rounded-lg flex items-center justify-center"><Star className="w-5 h-5" /></div>
                            </div>
                            <p className="text-4xl font-bold text-gray-900">{performanceData.avgRating.toFixed(1)}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                                <div className="w-10 h-10 bg-green-100 text-green-500 rounded-lg flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
                            </div>
                            <p className="text-4xl font-bold text-gray-900">{performanceData.completionRate}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                           <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-gray-500">Jobs Completed</p>
                                <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center"><Briefcase className="w-5 h-5" /></div>
                            </div>
                            <p className="text-4xl font-bold text-gray-900">{performanceData.completedBookings}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                           <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                                <div className="w-10 h-10 bg-purple-100 text-purple-500 rounded-lg flex items-center justify-center"><BarChart2 className="w-5 h-5" /></div>
                            </div>
                            <p className="text-4xl font-bold text-gray-900">{performanceData.totalBookings}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Star Rating Trends</h3>
                                    <p className="text-sm text-gray-500">Last {performanceData.starRatingTrend.length} Months</p>
                                </div>
                                <div className="text-3xl font-bold text-gray-900">{latestTrendValue.toFixed(1)} <span className='text-xl text-amber-400'>★</span></div>
                            </div>
                            <RatingTrendChart data={performanceData.starRatingTrend} />
                        </div>

                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                             <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Completion by Service</h3>
                                <p className="text-sm text-gray-500">Overall performance</p>
                            </div>
                            <div className="space-y-4">
                                {performanceData.serviceBreakdown.map((service, index) => (
                                    <div key={service.serviceName}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-600">{service.serviceName}</span>
                                            <span className="text-sm font-bold text-gray-800">{service.completionRate}%</span>
                                        </div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div className={`h-full bg-gradient-to-r ${serviceColors[index % serviceColors.length]}`} style={{ width: `${service.completionRate}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews & Ratings</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="text-center mb-4">
                                    <p className="text-5xl font-bold text-gray-900">{performanceData.avgRating.toFixed(1)}</p>
                                    <div className="flex justify-center my-2">{renderStars(performanceData.avgRating)}</div>
                                    <p className="text-sm text-gray-500">Based on {performanceData.reviews.length} reviews</p>
                                </div>
                                <div className="space-y-2">
                                    {performanceData.ratingDistribution.map((rating) => (
                                        <div key={rating.stars} className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-gray-500">{rating.stars} star</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${rating.percentage}%` }}></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 w-10 text-right">{rating.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                {performanceData.reviews.map((review, index) => (
                                    <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                        <div className="flex items-start gap-4">
                                            <img src={review.avatar ? getCloudinaryUrl(review.avatar) : '/profileImage.png'} alt={`${review.name}'s avatar`} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{review.name}</p>
                                                        <p className="text-xs text-gray-500">{review.time}</p>
                                                    </div>
                                                    {renderStars(review.rating)}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
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
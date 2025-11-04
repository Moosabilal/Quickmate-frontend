import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Search, ChevronDown } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { IReviewAdminFilters, ReviewData } from '../../util/interface/IReview';
import Pagination from '../../components/admin/Pagination';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const ReviewModerationPage: React.FC = () => {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRating, setSelectedRating] = useState('All');
    const [selectedDate, setSelectedDate] = useState('Newest');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);

    const ratingOptions = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];
    const dateOptions = ['Newest', 'Oldest'];

    const fetchReviews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: IReviewAdminFilters = {
                page: pagination.page,
                limit: 10,
                sort: selectedDate.toLowerCase() as 'newest' | 'oldest',
            };

            if (debouncedSearchTerm) {
                filters.search = debouncedSearchTerm;
            }
            if (selectedRating !== 'All') {
                filters.rating = parseInt(selectedRating.split(' ')[0], 10);
            }

            const response = await reviewService.getReviewsForAdmin(filters);

            if (response.success) {
                setReviews(response.data);
                setPagination({
                    page: response.pagination.page,
                    totalPages: response.pagination.totalPages,
                    total: response.pagination.total,
                });
            } else {
                throw new Error(response.message || "Failed to fetch reviews.");
            }
        } catch (err) {
            setError("An error occurred while fetching reviews.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, debouncedSearchTerm, selectedRating, selectedDate]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearchTerm, selectedRating, selectedDate]);


    const renderStars = (rating: number) => (
        <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-amber-400' : 'text-gray-300'}`} />
            ))}
        </div>
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center space-x-4 mb-6">
                    <button className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reviews</h1>
                </div>
                <p className="text-gray-600 mb-6">Manage user reviews to maintain platform trust and quality.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="md:col-span-2">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by user, provider, or content..." className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <button type="button" onClick={() => setIsRatingOpen(!isRatingOpen)} className="inline-flex justify-between items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{selectedRating === 'All' ? 'Rating' : selectedRating}<ChevronDown className="-mr-1 ml-2 h-5 w-5" /></button>
                            {isRatingOpen && (<div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"><div className="py-1">{ratingOptions.map((option) => (<button key={option} onClick={() => { setSelectedRating(option); setIsRatingOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{option}</button>))}</div></div>)}
                        </div>
                        <div className="relative">
                            <button type="button" onClick={() => setIsDateOpen(!isDateOpen)} className="inline-flex justify-between items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{selectedDate}<ChevronDown className="-mr-1 ml-2 h-5 w-5" /></button>
                            {isDateOpen && (<div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"><div className="py-1">{dateOptions.map((option) => (<button key={option} onClick={() => { setSelectedDate(option); setIsDateOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{option}</button>))}</div></div>)}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">User</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Provider</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">Review</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Rating</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading reviews...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-red-500">{error}</td></tr>
                                ) : reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{review.provider.name}</td>
                                            <td className="px-6 py-4 max-w-sm text-sm text-gray-700"><p className="line-clamp-2">{review.reviewContent}</p></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{renderStars(review.rating)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button className="text-indigo-600 hover:text-indigo-900">Remove</button>
                                                    <span className="text-gray-300">|</span>
                                                    <button className="text-red-600 hover:text-red-900">Ban User</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No reviews found matching your criteria.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!isLoading && reviews.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                total={pagination.total}
                                limit={10}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewModerationPage;
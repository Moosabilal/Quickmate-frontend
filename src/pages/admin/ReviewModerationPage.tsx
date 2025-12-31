import React, { useState, useEffect, useCallback } from 'react';
import { Star, Search, ChevronDown, Trash2, UserX, Check, X, CheckCircle } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { IReviewAdminFilters, ReviewData, ReviewStatus } from '../../util/interface/IReview';
import Pagination from '../../components/admin/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { isAxiosError } from 'axios';
import { ReviewAction } from '../../util/interface/IReviewActionModel';
import ReviewActionModal from '../../components/admin/ReviewActionModal';
import { StatusBadge } from '../../components/admin/ReviewStatus';
import { ReviewTableRowSkeleton } from '../../components/admin/ReviewTableRowSkeleton';

const REVIEWS_PER_PAGE = 10

const ReviewModerationPage: React.FC = () => {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [activeTab, setActiveTab] = useState<ReviewStatus>(ReviewStatus.PENDING);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRating, setSelectedRating] = useState('All');
    const [selectedDate, setSelectedDate] = useState('Newest');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState<ReviewAction | null>(null);
   const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);

    const ratingOptions = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];
    const dateOptions = ['Newest', 'Oldest'];

    const tabs = [
        { label: 'Pending', status: ReviewStatus.PENDING },
        { label: 'Approved', status: ReviewStatus.APPROVED },
        { label: 'Removed', status: ReviewStatus.REMOVED },
    ];

    const fetchReviews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: IReviewAdminFilters = {
                page: pagination.page,
                limit: REVIEWS_PER_PAGE,
                sort: selectedDate.toLowerCase() as 'newest' | 'oldest',
                status: activeTab,
            };

            if (debouncedSearchTerm) {
                filters.search = debouncedSearchTerm;
            }
            if (selectedRating !== 'All') {
                filters.rating = parseInt(selectedRating.split(' ')[0], 10);
            }

            const response = await reviewService.getReviewsForAdmin(filters);
            console.log("Fetched Reviews Response:", response.data);

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
    }, [pagination.page, debouncedSearchTerm, selectedRating, activeTab, selectedDate]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearchTerm, selectedRating, activeTab, selectedDate]);


    const renderStars = (rating: number) => (
        <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-gray-600'}`} />
            ))}
        </div>
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleApproveClick = (review: ReviewData) => {
        setModalAction(activeTab === ReviewStatus.REMOVED ? 're-approve' : 'approve');
        setSelectedReview(review);
        setShowModal(true);
    };

    const handleRejectClick = (review: ReviewData) => {
        setModalAction('reject');
        setSelectedReview(review);
        setShowModal(true);
    };

    const handleBanClick = (review: ReviewData) => {
        setModalAction(review.user.isVerified ? 'ban' : 'unban');
        setSelectedReview(review);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setTimeout(() => {
            setSelectedReview(null);
            setModalAction(null);
        }, 300);
    };

    const handleConfirmAction = async () => {
        if (!modalAction || !selectedReview) return;

        setIsProcessing(true);
        try {
            switch (modalAction) {
                case 'approve':
                case 're-approve':
                    await reviewService.updateReviewStatus(selectedReview.id, ReviewStatus.APPROVED);
                    toast.success(`Review has been approved.`);
                    break;
                case 'reject':
                    await reviewService.updateReviewStatus(selectedReview.id, ReviewStatus.REMOVED);
                    toast.warn(`Review from ${selectedReview.user.name} has been removed.`);
                    break;
                case 'ban':
                case 'unban':{
                    const response = await authService.updateUser(selectedReview.user.id);
                    toast.success(response.message);
                    setReviews(prevReviews => 
                        prevReviews.map(r => 
                            r.user.id === selectedReview.user.id 
                            ? { ...r, user: { ...r.user, isVerified: !r.user.isVerified } } 
                            : r
                        )
                    );
                }
                    break;
            }
            
            if (modalAction !== 'ban' && modalAction !== 'unban') {
                fetchReviews();
            }
            handleModalClose();
        } catch (err) {
            let errorMessage = "An error occurred.";
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-700 flex flex-col transition-colors duration-300">
            <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                
                <p className="text-slate-600 dark:text-gray-300 mb-6">Manage user reviews to maintain platform trust and quality.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="lg:col-span-2">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400 dark:text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                placeholder="Search by user, provider, or content..." 
                                className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm" 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <button 
                                type="button" 
                                onClick={() => setIsRatingOpen(!isRatingOpen)} 
                                className="inline-flex justify-between items-center w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                {selectedRating === 'All' ? 'All Ratings' : selectedRating}
                                <ChevronDown className={`-mr-1 ml-2 h-5 w-5 transition-transform ${isRatingOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isRatingOpen && (
                                <div className="absolute z-10 mt-2 w-full rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="py-1">
                                        {ratingOptions.map((option) => (
                                            <button 
                                                key={option} 
                                                onClick={() => { setSelectedRating(option); setIsRatingOpen(false); }} 
                                                className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button 
                                type="button" 
                                onClick={() => setIsDateOpen(!isDateOpen)} 
                                className="inline-flex justify-between items-center w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                {selectedDate}
                                <ChevronDown className={`-mr-1 ml-2 h-5 w-5 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDateOpen && (
                                <div className="absolute z-10 mt-2 w-full rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="py-1">
                                        {dateOptions.map((option) => (
                                            <button 
                                                key={option} 
                                                onClick={() => { setSelectedDate(option); setIsDateOpen(false); }} 
                                                className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-6 border-b border-slate-200 dark:border-gray-600">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => setActiveTab(tab.status)}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    tab.status === activeTab
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:border-slate-300 dark:hover:border-gray-500'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-gray-600/50 transition-colors">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                            <thead className="bg-slate-50 dark:bg-gray-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider min-w-[140px]">User</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider min-w-[140px]">Provider</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider min-w-[250px]">Review</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">Rating</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">Date</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">Status</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider min-w-[180px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-700">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => <ReviewTableRowSkeleton key={i} />)
                                ) : error ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-red-500 dark:text-red-400 font-medium">{error}</td></tr>
                                ) : reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{review.user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-gray-300">{review.provider.name}</td>
                                            <td className="px-6 py-4 max-w-sm text-sm text-slate-700 dark:text-gray-300">
                                                <p className="line-clamp-2" title={review.reviewContent}>{review.reviewContent}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{renderStars(review.rating)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">{review.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <StatusBadge status={review.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    {activeTab === ReviewStatus.PENDING && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApproveClick(review)} 
                                                                className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded transition-colors"
                                                                title="Approve Review"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <span className="text-slate-300 dark:text-gray-600">|</span>
                                                            <button 
                                                                onClick={() => handleRejectClick(review)} 
                                                                className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                title="Reject Review"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {activeTab === ReviewStatus.APPROVED && (
                                                        <button 
                                                            onClick={() => handleRejectClick(review)} 
                                                            className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Remove
                                                        </button>
                                                    )}
                                                    {activeTab === ReviewStatus.REMOVED && (
                                                        <button 
                                                            onClick={() => handleApproveClick(review)} 
                                                            className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded transition-colors"
                                                        >
                                                            <Check className="w-4 h-4" /> Re-Approve
                                                        </button>
                                                    )}
                                                    <span className="text-slate-300 dark:text-gray-600">|</span>
                                                    {review.user.isVerified ? (
                                                        <button 
                                                            onClick={() => handleBanClick(review)} 
                                                            className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded transition-colors"
                                                            title="Ban User"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleBanClick(review)} 
                                                            className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded transition-colors"
                                                            title="Unban User"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-gray-400">No reviews found matching your criteria.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!isLoading && reviews.length > 0 && (
                        <div className="bg-slate-50 dark:bg-gray-700/30 px-6 py-4 border-t border-slate-200 dark:border-gray-700 rounded-b-2xl">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                total={pagination.total}
                                limit={REVIEWS_PER_PAGE}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
            
            {showModal && selectedReview && modalAction && (
                <ReviewActionModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onConfirm={handleConfirmAction}
                    isLoading={isProcessing}
                    action={modalAction}
                    itemName={modalAction.includes('ban') ? selectedReview.user.name : undefined}
                    itemDetails={!modalAction.includes('ban') ? selectedReview.reviewContent : undefined}
                />
            )}
        </div>
    );
};

export default ReviewModerationPage;
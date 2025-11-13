import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Search, ChevronDown, Trash2, UserX, Check, X, CheckCircle } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { IReviewAdminFilters, ReviewData, ReviewStatus } from '../../util/interface/IReview';
import Pagination from '../../components/admin/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { ReviewAction } from '../../util/interface/IReviewActionModel';
import ReviewActionModal from '../../components/admin/ReviewActionModal';
import { StatusBadge } from '../../components/admin/ReviewStatus';

const REVIEWS_PER_PAGE = 10

const ReviewTableRowSkeleton: React.FC = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </td>
        <td className="px-6 py-4">
            <div className="flex space-x-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
        </td>
    </tr>
);

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
                <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-amber-400' : 'text-gray-300'}`} />
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
        // Delay clearing data to allow modal to fade out
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
                    // Manually update UI state
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
                fetchReviews(); // Refetch review list
            }
            handleModalClose();
        } catch (err: any) {
            toast.error(err.message || "An error occurred.");
        } finally {
            setIsProcessing(false);
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => setActiveTab(tab.status)}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${tab.status === activeTab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => <ReviewTableRowSkeleton key={i} />)
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <StatusBadge status={review.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    {activeTab === ReviewStatus.PENDING && (
                                                        <>
                                                            <button onClick={() => handleApproveClick(review)} className="flex items-center gap-1 text-green-600 hover:text-green-900">
                                                                <Check className="w-4 h-4" /> Approve
                                                            </button>
                                                            <span className="text-gray-300">|</span>
                                                            <button onClick={() => handleRejectClick(review)} className="flex items-center gap-1 text-red-600 hover:text-red-900">
                                                                <X className="w-4 h-4" /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {activeTab === ReviewStatus.APPROVED && (
                                                        <button onClick={() => handleRejectClick(review)} className="flex items-center gap-1 text-red-600 hover:text-red-900">
                                                            <Trash2 className="w-4 h-4" /> Remove
                                                        </button>
                                                    )}
                                                    {activeTab === ReviewStatus.REMOVED && (
                                                        <button onClick={() => handleApproveClick(review)} className="flex items-center gap-1 text-green-600 hover:text-green-900">
                                                            <Check className="w-4 h-4" /> Re-Approve
                                                        </button>
                                                    )}
                                                    <span className="text-gray-300">|</span>
                                                    {review.user.isVerified ? (
                                                        <button onClick={() => handleBanClick(review)} className="flex items-center gap-1 text-red-600 hover:text-red-900">
                                                            <UserX className="w-4 h-4" /> Ban User
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleBanClick(review)} className="flex items-center gap-1 text-green-600 hover:text-green-900">
                                                            <CheckCircle className="w-4 h-4" /> Unban User
                                                        </button>
                                                    )}
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
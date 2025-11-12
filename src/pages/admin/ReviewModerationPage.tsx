import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Search, ChevronDown, Trash2, UserX, Check, X } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { IReviewAdminFilters, ReviewData, ReviewStatus } from '../../util/interface/IReview';
import Pagination from '../../components/admin/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import DeleteConfirmationModal from '../../components/deleteConfirmationModel';


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
    const [modalAction, setModalAction] = useState<'reject' | 'ban' | 'approve' | null>(null);
    const [selectedItem, setSelectedItem] = useState<{ id: string, name: string, type: DeleteConfirmationTypes } | null>(null);

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
                limit: 10,
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
        setSelectedItem({ id: review.id, name: `review by ${review.user.name}`, type: DeleteConfirmationTypes.REVIEW });
        setModalAction('approve');
        setShowModal(true);
    };

    const handleRejectClick = (review: ReviewData) => {
        setSelectedItem({ id: review.id, name: `review by ${review.user.name}`, type: DeleteConfirmationTypes.REVIEW });
        setModalAction('reject');
        setShowModal(true);
    };

    const handleBanClick = (review: ReviewData) => {
        setSelectedItem({ id: review.id, name: review.user.name, type: DeleteConfirmationTypes.PROFILE }); // Use PROFILE type
        setModalAction('ban');
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedItem(null);
        setModalAction(null);
    };

    const handleConfirmAction = async () => {
        if (!modalAction || !selectedItem) return;

        setIsProcessing(true);
        try {
            if (modalAction === 'approve') {
                await reviewService.updateReviewStatus(selectedItem.id, ReviewStatus.APPROVED);
                toast.success(`Review has been approved.`);
            } else if (modalAction === 'reject') {
                // Soft delete by setting status to 'REMOVED'
                await reviewService.updateReviewStatus(selectedItem.id, ReviewStatus.REMOVED);
                toast.warn(`Review from ${selectedItem.name} has been removed.`);
            } else if (modalAction === 'ban') {
                // Ban the user by toggling their status
                const response = await authService.updateUser(selectedItem.id);
                toast.success(response.message);
                // No need to refetch reviews, but you might want to update user status locally if displayed
            }
            fetchReviews();
            handleModalClose();
        } catch (err: any) {
            toast.error(err.message || "An error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getModalConfig = () => {
        if (!modalAction || !selectedItem) return {};

        switch (modalAction) {
            case 'approve':
                return {
                    title: 'Approve Review',
                    confirmText: 'Approve',
                    message: `Are you sure you want to approve this review? It will become public.`,
                    type: DeleteConfirmationTypes.REVIEW // Can reuse this type
                };
            case 'reject':
                return {
                    title: 'Reject Review',
                    confirmText: 'Reject & Remove',
                    message: `Are you sure you want to reject this review? It will be moved to the 'Removed' tab.`,
                    type: DeleteConfirmationTypes.REVIEW
                };
            case 'ban':
                return {
                    title: 'Ban User',
                    confirmText: 'Ban User',
                    message: `Are you sure you want to ban ${selectedItem.name}? This will block their account.`,
                    type: DeleteConfirmationTypes.PROFILE
                };
            default:
                return {};
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.status}</td>
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
                                                    <button onClick={() => handleBanClick(review)} className="flex items-center gap-1 text-red-600 hover:text-red-900">
                                                        <UserX className="w-4 h-4" /> Ban User
                                                    </button>
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
            {showModal && selectedItem && (
                <DeleteConfirmationModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onConfirm={handleConfirmAction}
                    isLoading={isProcessing}
                    itemType={selectedItem.type}
                    itemName={selectedItem.name}
                    titleProp={getModalConfig().title}
                    confirmTextProp={getModalConfig().confirmText}
                    customMessage={getModalConfig().message as string}
                />
            )}
        </div>
    );
};

export default ReviewModerationPage;
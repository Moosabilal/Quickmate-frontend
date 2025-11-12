export enum ReviewStatus {
    ALL = 'All',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    PENDING = 'Pending',
    REMOVED = 'Removed',
}

export interface IReviewAdminFilters {
    page?: number;
    limit?: number;
    search?: string;
    rating?: number;
    sort?: 'newest' | 'oldest';
    status?: ReviewStatus;
}

export interface ReviewData {
    id: string;
    user: { name: string; };
    provider: { name: string; };
    reviewContent: string;
    rating: number;
    date: string;
    status: string;
}

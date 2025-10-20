export interface IReviewAdminFilters {
    page?: number;
    limit?: number;
    search?: string;
    rating?: number;
    sort?: 'newest' | 'oldest';
}

export interface ReviewData {
    id: string;
    user: { name: string; };
    provider: { name: string; };
    reviewContent: string;
    rating: number;
    date: string;
}
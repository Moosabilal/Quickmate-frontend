export interface IReviewAdminFilters {
    page?: number;
    limit?: number;
    search?: string;
    rating?: number;
    sort?: 'newest' | 'oldest';
}
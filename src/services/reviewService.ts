import axiosInstance from "../lib/axiosInstance";
import { IReviewAdminFilters } from "../util/interface/IReview";
import { handleAxiosError } from "../util/helperFunction/handleError";

const REVIEW_URL = `/review`;

export const reviewService = {

    addReview: async (bookingId: string, reviewData: { rating: number; review: string }) => {
        try {
            const response = await axiosInstance.post(`${REVIEW_URL}/addReview`, { bookingId, ...reviewData });
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to add review.");
        }
    },

    getReviewsForAdmin: async (filters: IReviewAdminFilters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.page) params.append('page', String(filters.page));
            if (filters.limit) params.append('limit', String(filters.limit));
            if (filters.search) params.append('search', filters.search);
            if (filters.rating) params.append('rating', String(filters.rating));
            if (filters.sort) params.append('sort', filters.sort);

            const response = await axiosInstance.get(`${REVIEW_URL}/reviews`, { params });
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to fetch reviews for admin.");
        }
    }
};

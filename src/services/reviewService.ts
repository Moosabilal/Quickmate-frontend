import axios from "axios";
import axiosInstance from "../API/axiosInstance";

const REVIEW_URL = `/review`;

export const reviewService = {
    addReview: async (bookingId: string, reviewData: { rating: number; review: string }) => {
        try {
            const response = await axiosInstance.post(`${REVIEW_URL}/addReview`, { bookingId, ...reviewData });
            console.log('its returnign')
            return response.data
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    }
}
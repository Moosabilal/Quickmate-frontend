import axiosInstance from '../lib/axiosInstance';
const API_URL = `/admin`;

export const adminService = {

    fetchAdminDashboard: async () => {
        try {
            const response = await axiosInstance.get(`${API_URL}/getAdminDashboard` );
            return response.data;
        } catch (error) {
            throw error
        }
    },

    getDashboardAnalytics: async () => {
        try {
            const response = await axiosInstance.get(`${API_URL}/analytics/dashboard`);
            return response.data;
        } catch (error) {
            console.error("Error fetching analytics dashboard data:", error);
            throw error;
        }
    }
};
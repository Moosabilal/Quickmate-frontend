import axiosInstance from '../API/axiosInstance';
const API_URL = `/admin`;

export const adminService = {

    fetchAdminDashboard: async () => {
        try {
            const response = await axiosInstance.get(`${API_URL}/getAdminDashboard` );
            return response.data;
        } catch (error) {
            throw error
        }
    }
};
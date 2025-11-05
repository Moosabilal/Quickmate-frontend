import axiosInstance from "../lib/axiosInstance";
import { handleAxiosError } from "../util/helperFunction/handleError";

const API_URL = `/admin`;

export const adminService = {
  fetchAdminDashboard: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/getAdminDashboard`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch admin dashboard data.");
    }
  },

  getDashboardAnalytics: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/analytics/dashboard`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch analytics dashboard data.");
    }
  },
};

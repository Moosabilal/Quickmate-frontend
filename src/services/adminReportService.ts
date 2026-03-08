import { AxiosError } from "axios";
import axiosInstance from "../lib/axiosInstance";

export const adminReportService = {
    getReportsForAdmin: async (page = 1, limit = 10) => {
        try {
            const response = await axiosInstance.get('/reports/admin', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(error.response?.data?.message || "Failed to fetch reports");
            }
            throw new Error("Failed to fetch reports");
        }
    },

    updateReportStatus: async (reportId: string, status: string, adminReply?: string, resolutionType?: string, newProviderId?: string) => {
        try {
            const payload: any = { status };
            if (adminReply) payload.adminFeedback = adminReply; // Use feedback name
            if (resolutionType) payload.resolutionType = resolutionType;
            if (newProviderId) payload.newProviderId = newProviderId;

            const response = await axiosInstance.patch(`/reports/admin/${reportId}/status`, payload);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(error.response?.data?.message || "Failed to update report status");
            }
            throw new Error("Failed to update report status");
        }
    }
};

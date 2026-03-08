import { AxiosError } from "axios";
import axiosInstance from "../lib/axiosInstance";
const reportUrl = "/reports";

export const reportService = {
    createReport: async (
        bookingId: string,
        reason: string,
        description: string
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await axiosInstance.post(reportUrl, {
                bookingId,
                reason,
                description,
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(error.response?.data?.message || "Failed to submit report");
            }
            throw new Error("Failed to submit report");
        }
    },

    getUserReports: async () => {
        try {
            const response = await axiosInstance.get(reportUrl);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(error.response?.data?.message || "Failed to fetch reports");
            }
            throw new Error("Failed to fetch reports");
        }
    },

    scheduleUserRework: async (reportId: string, scheduledDate: string, scheduledTime: string) => {
        try {
            const response = await axiosInstance.post(`${reportUrl}/${reportId}/schedule-rework`, {
                scheduledDate,
                scheduledTime
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(error.response?.data?.message || "Failed to schedule rework session");
            }
            throw new Error("Failed to schedule rework session");
        }
    },
};

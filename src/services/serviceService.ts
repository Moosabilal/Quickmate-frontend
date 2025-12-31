import axiosInstance from "../lib/axiosInstance";
import { handleAxiosError } from "../util/helperFunction/handleError";

const SERVICE_URL = `/services`;

export const serviceService = {

    createdService: async (formData: FormData) => {
        try {
            console.log('coming')
            const response = await axiosInstance.post(`${SERVICE_URL}/addService`, formData);
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to create service.");
        }
    },

    updateService: async (id: string, formData: FormData) => {
        try {
            const response = await axiosInstance.put(`${SERVICE_URL}/updateService/${id}`, formData);
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to update service.");
        }
    },

    getServicesByProviderId: async (providerId: string) => {
        try {
            const response = await axiosInstance.get(`${SERVICE_URL}/getServicesForProvider/${providerId}`);
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to fetch services for the provider.");
        }
    },

    getServiceById: async (id: string) => {
        try {
            const response = await axiosInstance.get(`${SERVICE_URL}/getServiceById/${id}`);
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to fetch service details.");
        }
    },

    deleteService: async (id: string) => {
        try {
            const response = await axiosInstance.delete(`${SERVICE_URL}/deleteService/${id}`);
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to delete service.");
        }
    },
};

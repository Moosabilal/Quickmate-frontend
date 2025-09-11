import axios from "axios";
import axiosInstance from "../API/axiosInstance";
import { FilterParams } from "../pages/user/ProviderPopupPage";

const PROVIDER_URL = `/provider`;

export const providerService = {
    register: async (formData: FormData) => {

        const response = await axiosInstance.post(`${PROVIDER_URL}/register`, formData)
        return response.data;
    },

    verifyRegistrationOtp: async (email: string, otp: string) => {
        const response = await axiosInstance.post(`${PROVIDER_URL}/verify-registration-otp`, { email, otp });
        return response.data;
    },

    resendRegistrationOtp: async (email: string) => {
        const response = await axiosInstance.post(`${PROVIDER_URL}/resend-registration-otp`, { email });
        return response.data;
    },

    updateProvider: async (formData: FormData) => {
        const { data } = await axiosInstance.post(`${PROVIDER_URL}/updateProvider`, formData)
        return data
    },

    getProvider: async () => {
        const response = await axiosInstance.get(`${PROVIDER_URL}/getProvider`)
        return response.data
    },

    getServicesForAddpage: async () => {
        const response = await axiosInstance.get(`${PROVIDER_URL}/getServicesForAddPage`)
        return response.data
    },

    getProvidersWithAllDetails: async () => {
        const response = await axiosInstance.get(`${PROVIDER_URL}/getAllProviders`)
        return response.data
    },

    getProvidersForAdmin: async (filters: {
        search?: string;
        status?: string;
        verification?: string;
        rating?: string;
        page?: number;
        limit?: number;
    }) => {
        const queryParams = new URLSearchParams(filters as any).toString();
        const response = await axiosInstance.get(`${PROVIDER_URL}/getProviderList?${queryParams}`);
        return response.data

    },

    getFeaturedProviders: async ({ page, limit, search }: { page?: number, limit?: number, search?: string } = {}) => {
        const response = await axiosInstance.get(`${PROVIDER_URL}/getFeaturedProviders`, {
            params: { page, limit, search }
        })
        return response.data
    },

    getState: async (lat: number, lng: number) => {

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Failed to fetch location:', err);
        }
    },

    updateProviderStatus: async (id: string, newStatus: string) => {
        const response = await axiosInstance.patch(`${PROVIDER_URL}/updateProviderStatus/${id}`, { newStatus })
        return response.data
    },

    getserviceProvider: async (serviceId: string, filters: FilterParams) => {
        const response = await axiosInstance.get(`${PROVIDER_URL}/getFilteredServiceProvider`, { params: { serviceId, ...filters } })
        return response.data
    },

    getProviderForChatPage: async () => {
        try {
            const response = await axiosInstance.get(`${PROVIDER_URL}/getProviderForChatPage`)
            return response.data
        } catch (error) {
            console.log('Error in getting getProviderForChatPage', error)
            throw error

        }
    },

    getProviderDash: async () => {
        try {
            const response = await axiosInstance.get(`${PROVIDER_URL}/getProviderDashboard`)
            return response.data
        } catch (error) {
            console.log('Error in getting getProviderForChatPage', error)
            throw error
        }
    }


}
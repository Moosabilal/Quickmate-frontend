import axios from "axios";
import axiosInstance from "../API/axiosInstance";

const PROVIDER_URL = `/provider`;

export const providerService = {
    register: async (formData: FormData) => {

        const response = await axiosInstance.post(`${PROVIDER_URL}/register`, formData)
        return response;
    },

    getProviderById: async (userId: string) => {
        const response = await axiosInstance.get(`${PROVIDER_URL}/getProviderById/${userId}`)
        console.log('the userid response', response)
        return response
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

    getFeaturedProviders: async ({page, limit, search}: { page?: number, limit?: number, search?: string} = {}) => {
        const response = await axiosInstance.get(`${PROVIDER_URL}/getFeaturedProviders`, {
            params: { page, limit, search}
        })
        console.log('the responxse', response)
        return response.data
    },

    // getState: async ({lat: string, lng: string}) => {
    //     console.log('the location',lat,lng)
    //     const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    //     const data = await response.json();
    //     console.log('the locain result', data)
    // }

}
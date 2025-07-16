import axios from "axios";
import axiosInstance from "../API/axiosInstance";

const PROVIDER_URL = `/provider`;

export const providerService = {
    register: async (formData: FormData) => {
        
        const response = await axiosInstance.post(`${PROVIDER_URL}/register`,formData)
        return response;
    },

    getProvidersWithAllDetails: async () => {
        const response = await axiosInstance.get(`${PROVIDER_URL}/getAllProviders`)
        return response.data
    },

    getProvidersForAdmin: async () => {
        const response = await axiosInstance.get(`${PROVIDER_URL}/getProviderList`)
        console.log('this ithe serive', response)
        return response.data
    }
}
import axiosInstance from "../lib/axiosInstance";
import { IAddress } from "../util/interface/IAddress";
const ADDRESS_URL = `/address`

export const addressService = {
    async createAddress(addressData: IAddress) {
        try {
            const response = await axiosInstance.post(`${ADDRESS_URL}/createAddress`, addressData)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async updateAddress(id: string, addressData: IAddress) {
        try {
            const response = await axiosInstance.put(`${ADDRESS_URL}/updateAddress/${id}`, addressData)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async getAddress() {
        try {
            const response = await axiosInstance.get(`${ADDRESS_URL}`)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async deleteAddress(id: string) {
        try {
            const response = await axiosInstance.delete(`${ADDRESS_URL}/deleteAddress/${id}`)
            return response.data

        } catch (error) {
            throw error
        }
    },

    getLocationByPincode: async (street: string, city: string, state: string, pincode: string) => {

        try {
            const searchQuery = encodeURIComponent(`${pincode}, ${state}, India`);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
            return await response.json();
        } catch (err) {
            console.error('Failed to fetch getLocationByPincode:', err);
        }
    },
}
import axiosInstance from "../lib/axiosInstance";
import { handleAxiosError } from "../util/interface/helperFunction/handleError";
import { IAddress } from "../util/interface/IAddress";

const ADDRESS_URL = `/address`;

export const addressService = {
  createAddress: async (addressData: IAddress) => {
    try {
      const response = await axiosInstance.post(`${ADDRESS_URL}/createAddress`, addressData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to create address.");
    }
  },

  updateAddress: async (id: string, addressData: IAddress) => {
    try {
      const response = await axiosInstance.put(`${ADDRESS_URL}/updateAddress/${id}`, addressData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to update address.");
    }
  },

  getAddress: async () => {
    try {
      const response = await axiosInstance.get(`${ADDRESS_URL}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch addresses.");
    }
  },

  deleteAddress: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`${ADDRESS_URL}/deleteAddress/${id}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to delete address.");
    }
  },

  getLocationByPincode: async (street: string, city: string, state: string, pincode: string) => {
    try {
      const searchQuery = encodeURIComponent(`${pincode}, ${state}, India`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);

      if (!response.ok) {
        throw new Error("Failed to fetch location from OpenStreetMap.");
      }

      return await response.json();
    } catch (error) {
      handleAxiosError(error, "An unexpected error occurred while getting the location.");
    }
  },
};

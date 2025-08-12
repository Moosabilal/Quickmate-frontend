import axiosInstance from "../API/axiosInstance";
import { IAddress } from "../interface/IAddress";
const  ADDRESS_URL = `/address`

export const addressService = {
    async createAddress(addressData: IAddress){
        try {
            const response = await axiosInstance.post(`${ADDRESS_URL}/createAddress`, addressData)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async updateAddress(id: string, addressData: IAddress){
        try {
            const response = await axiosInstance.put(`${ADDRESS_URL}/updateAddress/${id}`, addressData)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async getAddress(){
        try {
            const response = await axiosInstance.get(`${ADDRESS_URL}`)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async deleteAddress(id: string){
        try {
            const response = await axiosInstance.delete(`${ADDRESS_URL}/deleteAddress/${id}`)
            return response.data
            
        } catch (error) {
            throw error
        }
    }
}
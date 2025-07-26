import axiosInstance from "../API/axiosInstance";
import { IAddress } from "../types/address";
const  ADDRESS_URL = `/address`

export const addressService = {
    async createAddress(addressData: IAddress){
        try {
            console.log('data adress to send backend', addressData)
            const response = await axiosInstance.post(`${ADDRESS_URL}/createAddress`, addressData)
            console.log('the address service response', response)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async updateAddress(id: string, addressData: IAddress){
        try {
            console.log('data adress to send backend', addressData)
            const response = await axiosInstance.put(`${ADDRESS_URL}/updateAddress/${id}`, addressData)
            console.log('the address service response', response)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async getAddress(){
        try {
            const response = await axiosInstance.get(`${ADDRESS_URL}`)
            console.log('the address service getdataaaaa', response)
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
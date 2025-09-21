import axiosInstance from "../API/axiosInstance"

const SERVICE_URL = `/services`

export const serviceService = {
    createdService: async (formData: FormData) => {
        try {
            const response = await axiosInstance.post(`${SERVICE_URL}/addService`, formData)
            return response.data
        } catch (error) {
            console.log('Error adding a new service',error)
            throw error;
        }
    },

    updateService: async (id: string, formData: FormData) => {
        try {
            const response = await axiosInstance.put(`${SERVICE_URL}/updateService/${id}`, formData)
            return response.data
        } catch (error) {
            console.log('Error updating a service',error)
            throw error;
        }
    },

    getServicesByProviderId: async (providerId: string) => {
        try {
            const response = await axiosInstance.get(`${SERVICE_URL}/getServicesForProvider/${providerId}`)
            return response.data
        } catch (error) {
            console.log('Error in getting servicesByProviderId', error)
            throw error
        }
    },

    getServiceById: async (id: string) => {
        try {
            const response = await axiosInstance.get(`${SERVICE_URL}/getServiceById/${id}`)
            return response.data
        } catch (error) {
            console.log('Error getting serviceById', error)
            throw error
        }
    },

    deleteService: async (id: string) => {
        try {
            const response = await axiosInstance.delete(`${SERVICE_URL}/deleteService/${id}`)
            return response.data
        } catch (error) {
            console.log('Error in deleting service', error)
            throw error
        }
    }
}
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
    }
}
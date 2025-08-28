import axiosInstance from "../API/axiosInstance";
import { IBookingRequest } from "../interface/IBooking";
import { paymentVerificationRequest } from "../interface/IPayment";
const BOOKING_URL = `/bookings`;

export const bookingService = {
  createBooking: async (bookingData: IBookingRequest) => {
    const response = await axiosInstance.post(`${BOOKING_URL}/createBooking`, bookingData);
    return response.data;
  },

  confirmPayment: async (amount: number, currency?: string, receipt?: string) => {
    try {
      const response = await axiosInstance.post(`${BOOKING_URL}/payment`, { amount, currency, receipt })
      return response.data
    } catch (error) {
      console.log(`Error in confirm payment`, error)
      throw error
    }
  },

  verifyPayment: async (verificationData: paymentVerificationRequest) => {
    try {
      const response = await axiosInstance.post(`${BOOKING_URL}/verifyPayment`, verificationData )
      return response.data
    } catch (error) {
      console.log('Error when verifying payment', error)
      throw error
    }
  },

  getBookingById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}/getBookingById/${id}`)
      return response.data
    } catch (error) {
      console.log('Error in getting getBookingById', error)
      throw error
    }
  },

  getallBookings: async () => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}`)
      return response.data
    } catch (error) {
      console.log('Error in getting getFilteredBooking', error)
      throw error
    }
  },

  getBookingFor_Prov_mngmnt: async (id: string) => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}/getBookingFor_Prov_mngmnt/${id}`)
      return response.data
    } catch (error) {
      console.log('Error in getting getBookingFor_Prov_mngmnt', error)
      throw error
    }
  },

  getAllPreviousChat: async (bookingId: string) => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}/getAllPreviousChats/${bookingId}`)
      return response.data
    } catch (error) {
      console.log('Error in getting getAllPreviousChat', error)
      throw error
    }
  },

  cancelBooking: async (id: string) => {
    try {
      const response = await axiosInstance.patch(`${BOOKING_URL}/cancelBooking/${id}`)
      return response.data
    } catch (error) {
      console.log('Error in cancelling booking', error)
      throw error
    }
  }

}
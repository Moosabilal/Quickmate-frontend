import axiosInstance from "../API/axiosInstance";
import { IBookingRequest } from "../interface/IBooking";
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

  verifyPayment: async (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) => {
    try {
      const response = await axiosInstance.post(`${BOOKING_URL}/verifyPayment`, {
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature
      })
      return response.data
    } catch (error) {
      console.log('Error when verifying payment', error)
      throw error
    }
  }
}
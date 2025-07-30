import axiosInstance from "../API/axiosInstance";
import { IBookingRequest } from "../interface/IBooking";
const   BOOKING_URL = `/bookings`;

export const bookingService = {
    createBooking: async (bookingData: IBookingRequest) => {
    const response = await axiosInstance.post(`${BOOKING_URL}/createBooking`, bookingData);
    return response.data;
  }
}
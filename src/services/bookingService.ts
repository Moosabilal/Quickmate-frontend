import axiosInstance from "../lib/axiosInstance";
import { handleAxiosError } from "../util/interface/helperFunction/handleError";
import {
  BookingStatus,
  IAdminBookingFilters,
  IBookingRequest,
} from "../util/interface/IBooking";
import { paymentVerificationRequest } from "../util/interface/IPayment";

const BOOKING_URL = `/bookings`;

export const bookingService = {

  createBooking: async (bookingData: IBookingRequest) => {
    try {
      const response = await axiosInstance.post(`${BOOKING_URL}/createBooking`, bookingData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to create booking.");
    }
  },

  confirmPayment: async (amount: number) => {
    try {
      const response = await axiosInstance.post(`${BOOKING_URL}/payment`, { amount });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to confirm payment.");
    }
  },

  verifyPayment: async (verificationData: paymentVerificationRequest) => {
    try {
      const response = await axiosInstance.post(`${BOOKING_URL}/verifyPayment`, verificationData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Payment verification failed.");
    }
  },

  getBookingById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}/getBookingById/${id}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch booking details.");
    }
  },

  getAllBookings: async () => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch bookings.");
    }
  },

  getBookingFor_Prov_mngmnt: async (id: string, searchTerm: string) => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}/getBookingFor_Prov_mngmnt/${id}`, {
        params: { search: searchTerm },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch provider bookings.");
    }
  },

  getAllPreviousChat: async (joiningId: string) => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}/getAllPreviousChats/${joiningId}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch previous chats.");
    }
  },

  updateBookingStatus: async (id: string, status: BookingStatus) => {
    try {
      const response = await axiosInstance.patch(`${BOOKING_URL}/updateBookingStatus/${id}`, { status });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to update booking status.");
    }
  },

  updateBookingDateTime: async (id: string, date: string, time: string) => {
    try {
      const response = await axiosInstance.patch(`${BOOKING_URL}/updateBookingDateTime/${id}`, { date, time });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to update booking date/time.");
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await axiosInstance.post(`${BOOKING_URL}/verify-bookingCompletion-otp`, { email, otp });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to verify OTP.");
    }
  },

  resendRegistrationOtp: async (email: string) => {
    try {
      const response = await axiosInstance.post(`${BOOKING_URL}/resend-bookingCompletion-otp`, { email });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to resend OTP.");
    }
  },

  getAllBookingsForAdmin: async (params: IAdminBookingFilters) => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}/admin/bookings`, { params });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch admin booking logs.");
    }
  },

  findProviderRange: async (serviceId: string, lat: number, lng: number, radius: number) => {
    try {
      const response = await axiosInstance.get(`${BOOKING_URL}/findProviderRange`, {
        params: { serviceId, lat, lng, radius },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch providers within range.");
    }
  },
};

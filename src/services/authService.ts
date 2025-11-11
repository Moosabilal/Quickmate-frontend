import axiosInstance from "../lib/axiosInstance";
import { handleAxiosError } from "../util/helperFunction/handleError";

const API_URL = `/auth`;

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/login`, { email, password });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to log in.");
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/register`, { name, email, password });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to register user.");
    }
  },

  verifyRegistrationOtp: async (email: string, otp: string) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/verify-registration-otp`, { email, otp });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to verify registration OTP.");
    }
  },

  resendRegistrationOtp: async (email: string) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/resend-registration-otp`, { email });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to resend registration OTP.");
    }
  },

  forgotPassword: async (email: string, currentPassword?: string) => {
    try {
      const params = currentPassword ? { email, currentPassword } : { email };
      const response = await axiosInstance.post(`${API_URL}/forgot-password`, params);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to process forgot password request.");
    }
  },

  googleAuthLogin: async (token: string) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/google-login`, { token });
      return response;
    } catch (error) {
      handleAxiosError(error, "Failed to log in with Google.");
    }
  },

  refreshToken: async () => {
    try {
      const response = await axiosInstance.post(`${API_URL}/refresh-token`);
      return response;
    } catch (error) {
      handleAxiosError(error, "Failed to refresh token.");
    }
  },

  contactUsSubmission: async (formData: { name: string; email: string; message: string }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/contactUsSubmission`, formData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to submit contact form.");
    }
  },

  getUser: async () => {
    try {
      console.log('how much time called')
      const response = await axiosInstance.get(`${API_URL}/getUser`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch user details.");
    }
  },

  updateProfile: async (formData: FormData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/update-profile`, formData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to update profile.");
    }
  },

  getUserWithAllDetails: async ({
    page,
    limit,
    search,
    status,
  }: {
    page: number;
    limit: number;
    search: string;
    status: string;
  }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/getUserWithAllDetails`, {
        params: { page, limit, search, status },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch user details with filters.");
    }
  },

  updateUser: async (userId: string) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/update-user/${userId}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to update user information.");
    }
  },

  getAllDataForChatBot: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/getAllDataForChatBot`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch chatbot data.");
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post(`${API_URL}/logout`);
      return;
    } catch (error) {
      handleAxiosError(error, "Failed to log out.");
    }
  },

  getUserDetailsForAdmin: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch user details for admin.");
    }
  },
};

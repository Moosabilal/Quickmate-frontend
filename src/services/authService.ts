import axiosInstance from '../lib/axiosInstance';
const API_URL = `/auth`;

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post(`${API_URL}/register`, { name, email, password });
    return response.data;
  },

  verifyRegistrationOtp: async (email: string, otp: string) => {
    const response = await axiosInstance.post(`${API_URL}/verify-registration-otp`, { email, otp });
    return response.data; 
  },

  resendRegistrationOtp: async (email: string) => {
    const response = await axiosInstance.post(`${API_URL}/resend-registration-otp`, { email });
    return response.data; 
  },

  forgotPassword: async (email: string, currentPassword?: string) => {
    const params = currentPassword ? { email, currentPassword } : { email };
    const response = await axiosInstance.post(`${API_URL}/forgot-password`, params);
    return response.data; 
  },

  googleAuthLogin: async (token: string) => {
    const response = await axiosInstance.post(`${API_URL}/google-login`, { token });
    return response; 
  },

  refreshToken: async () => {
    const response = await axiosInstance.post(`${API_URL}/refresh-token`);
    return response
  },

  contactUsSubmission: async (formData: {name: string, email: string, message: string}) => {
    const response = await axiosInstance.post(`${API_URL}/contactUsSubmission`,formData)
    return response.data
  },

  getUser: async () => {
    const response = await axiosInstance.get(`${API_URL}/getUser`);
    return response.data;
  },

  updateProfile: async (formData: FormData) => {
    const response = await axiosInstance.put(`${API_URL}/update-profile`,formData);
    return response.data;
  },

  getUserWithAllDetails: async ({ page, limit, search, status }: {page: number; limit: number; search: string; status: string;}) => {
  const response = await axiosInstance.get(`${API_URL}/getUserWithAllDetails`, {
    params: { page, limit, search, status },
  });
    return response.data;
  },

  updateUser: async (userId: string) => {
    const response = await axiosInstance.put(`${API_URL}/update-user/${userId}`);
    return response.data;
  },

  getAllDataForChatBot: async () => {
    const response = await axiosInstance.get(`${API_URL}/getAllDataForChatBot`)
    return response.data
  },

  logout: async () => {
    const response = await axiosInstance.post(`${API_URL}/logout`)
    return
  },

    getUserDetailsForAdmin: async (userId: string) => {
    const response = await axiosInstance.get(`${API_URL}/users/${userId}`);
    return response.data;
  },
  

};
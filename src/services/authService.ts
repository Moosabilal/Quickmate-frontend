import axiosInstance from '../API/axiosInstance';
const API_URL = `/auth`;

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post(`${API_URL}/login`, { email, password });
    console.log('the errror dataaaa', response)
    return response.data;
  },

  register: async (name: string, email: string, password: string, role: string) => {
    const response = await axiosInstance.post(`${API_URL}/register`, { name, email, password, role });
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

  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post(`${API_URL}/forgot-password`, { email });
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

  contactUsSubmission: async (formData) => {
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

  getUserWithAllDetails: async ({ page, limit, search, status }) => {
  const response = await axiosInstance.get(`${API_URL}/getUserWithAllDetails`, {
    params: { page, limit, search, status },
  });
    return response.data;
  },

  updateUser: async (userId: string) => {
    const response = await axiosInstance.put(`${API_URL}/update-user/${userId}`);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post(`${API_URL}/logout`)
    return
  }
  

};
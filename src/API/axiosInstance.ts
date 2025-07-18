import axios from 'axios';
import config from './config'; 
import { authService } from '../services/authService';

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true
  
});

axiosInstance.interceptors.request.use(
  (config) => {

    if(!config){
      console.log('config error')
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log('thie roginal request', originalRequest)
    console.log('thie roginal status', error.response?.status)

    // Handle 401 Unauthorized (Refresh Token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('the retry becimgnggggg true',!originalRequest._retry)
      originalRequest._retry = true;
            console.log('the retry became true',!originalRequest._retry)

      try {
        console.log('the refresh token calling')
        const refreshResponse = await authService.refreshToken();
        console.log('the refresh token called', refreshResponse)
        if (refreshResponse.status === 200) {
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('🔁 Refresh token failed:', refreshError);
        window.location.href = '/login';
      }
    }

    // Handle other errors globally
    const status = error.response?.status;
    console.log('error status', status)

    switch (status) {
      case 400:
        console.warn('Bad Request:', error.response.data?.message);
        break;
      case 403:
        console.warn('Forbidden:', error.response.data?.message);
        break;
      case 404:
        console.warn('Not Found:', error.response.data?.message);
        break;
      case 500:
        console.error('Internal Server Error:', error.response.data?.message);
        break;
      default:
        console.warn('Unhandled error:', error.response?.data?.message || error.message);
    }

    return Promise.reject(error); // Pass to catch block in component
  }
);

export default axiosInstance;
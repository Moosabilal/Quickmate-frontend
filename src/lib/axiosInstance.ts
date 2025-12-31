import axios from 'axios';
import config from './config';
import { authService } from '../services/authService';
import { Store } from '@reduxjs/toolkit';
import { logout } from '../features/auth/authSlice';

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true

});

export const setupInterceptors = (store: Store) => {

axiosInstance.interceptors.request.use(
  (config) => {

    if (!config) {
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

    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await authService.refreshToken();
        if (refreshResponse.status === 200) {
          return axiosInstance(originalRequest); 
        }
      } catch (refreshError) {
        console.error('🔁 Refresh token failed:', refreshError);
        store.dispatch(logout());
        window.location.href = '/login';
      }
    }

    const status = error.response?.status;
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

    return Promise.reject(error || "Something went wrong!, Please try again later");
  }
);
}

export default axiosInstance;

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
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshResponse = await authService.refreshToken();
                if (refreshResponse.status === 200) {
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;
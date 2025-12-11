import axiosInstance from "../lib/axiosInstance";
import { FilterParams, IAvailabilityUpdateData } from "../util/interface/IProvider";
import { handleAxiosError } from "../util/helperFunction/handleError";

const PROVIDER_URL = `/provider`;

export const providerService = {

  register: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post(`${PROVIDER_URL}/register`, formData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to register provider.");
    }
  },

  verifyRegistrationOtp: async (email: string, otp: string) => {
    try {
      const response = await axiosInstance.post(`${PROVIDER_URL}/verify-registration-otp`, { email, otp });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "OTP verification failed.");
    }
  },

  resendRegistrationOtp: async (email: string) => {
    try {
      const response = await axiosInstance.post(`${PROVIDER_URL}/resend-registration-otp`, { email });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to resend OTP.");
    }
  },

  updateProvider: async (formData: FormData) => {
    try {
      const { data } = await axiosInstance.post(`${PROVIDER_URL}/updateProvider`, formData);
      return data;
    } catch (error) {
      handleAxiosError(error, "Failed to update provider.");
    }
  },

  getProvider: async () => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/getProvider`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch provider details.");
    }
  },

  getProviderDetails: async (providerId: string) => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/details/${providerId}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch provider details.");
    }
  },

  getServicesForAddpage: async () => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/getServicesForAddPage`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch services for add page.");
    }
  },

  getProvidersWithAllDetails: async () => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/getAllProviders`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch providers with all details.");
    }
  },

  getProvidersForAdmin: async (filters: {
    search?: string;
    status?: string;
    rating?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      console.log('the type of reaign', typeof filters.rating, typeof filters.status)
      const queryParams = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined) acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      const response = await axiosInstance.get(`${PROVIDER_URL}/getProviderList?${queryParams}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch provider list for admin.");
    }
  },

  getFeaturedProviders: async ({ page, limit, search }: { page?: number; limit?: number; search?: string } = {}) => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/getFeaturedProviders`, {
        params: { page, limit, search },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch featured providers.");
    }
  },

  getState: async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch location: ${error.message}`);
      } else {
        throw new Error("An unexpected error occurred while fetching location.");
      }
    }
  },

  updateProviderStatus: async (id: string, newStatus: string) => {
    try {
      const response = await axiosInstance.patch(`${PROVIDER_URL}/updateProviderStatus/${id}`, { newStatus });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to update provider status.");
    }
  },

  getserviceProvider: async (serviceId: string, filters: Partial<FilterParams>) => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/getFilteredServiceProvider`, { params: { serviceId, ...filters } });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch filtered service providers.");
    }
  },

  getProviderForChatPage: async (search: string) => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/getProviderForChatPage`, { params: { search}});
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch provider for chat page.");
    }
  },

  getProviderDash: async () => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/getProviderDashboard`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch provider dashboard.");
    }
  },

  getProviderAvailability: async (
    latitude: number,
    longitude: number,
    serviceId: string,
    radius: number,
    timeMin: string,
    timeMax: string
  ) => {
    try {
      const params = { latitude, longitude, serviceId, radius, timeMin, timeMax };
      const response = await axiosInstance.get(`${PROVIDER_URL}/calendar/availability`, { params });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch provider availability.");
    }
  },

  getProvidersByLocation: async (
    serviceId: string,
    lat: number,
    lon: number,
    radius: number,
    filters: Partial<FilterParams> = {}
  ) => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/availability-by-location`, {
        params: { serviceId, lat, lon, radius, ...filters },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch providers by location.");
    }
  },

  getEarningsAnalytics: async (period: "week" | "month") => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/earnings`, { params: { period } });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch earnings analytics.");
    }
  },

  getProviderPerformance: async () => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/performance`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch provider performance.");
    }
  },

  getAvailability: async () => {
    try {
      const response = await axiosInstance.get(`${PROVIDER_URL}/availability`);
      return response.data.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch availability.");
    }
  },

  updateAvailability: async (data: IAvailabilityUpdateData) => {
    try {
      const response = await axiosInstance.put(`${PROVIDER_URL}/availability`, data);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to update availability.");
    }
  },

  getProviderFullDetails: async (providerId: string) => {
        try {
            const response = await axiosInstance.get(`${PROVIDER_URL}/admin/${providerId}/full-details`);
            return response.data.data;
        } catch (error) {
            handleAxiosError(error, "Failed to fetch provider full details.");
        }
    },
};

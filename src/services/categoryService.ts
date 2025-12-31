import axiosInstance from "../lib/axiosInstance";
import { handleAxiosError } from "../util/helperFunction/handleError";
import {
  CategoryFilters,
  ICategoryAdminResponse,
  ICategoryDetailsPageData,
  ICategoryResponse,
  ICommissionSummary,
  IserviceResponse,
} from "../util/interface/ICategory";

const CATEGORIES_PATH = "/categories";

export const categoryService = {
  async createCategory(formData: FormData): Promise<ICategoryResponse | undefined> {
    try {
      const response = await axiosInstance.post(CATEGORIES_PATH, formData);
      return response.data.category || response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to create category/subcategory.");
    }
  },

  async getCategoryById(id: string): Promise<ICategoryDetailsPageData | null> {
    try {
      const response = await axiosInstance.get(`${CATEGORIES_PATH}/${id}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch category/subcategory details.");
    }
  },

  async getCategoryForBooking(id: string): Promise<ICategoryDetailsPageData | undefined> {
    try {
      const response = await axiosInstance.get(`${CATEGORIES_PATH}/categoryForBooking${id}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch category for booking.");
    }
  },

  async getCategoryForEditAndShow(categoryId: string) {
    try {
      const response = await axiosInstance.get(`${CATEGORIES_PATH}/edit/${categoryId}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch category for edit.");
    }
  },

  async updateCategory(id: string, formData: FormData): Promise<ICategoryResponse | undefined> {
    try {
      const response = await axiosInstance.put(`${CATEGORIES_PATH}/${id}`, formData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to update category/subcategory.");
    }
  },

  async getAllCategories(filters?: CategoryFilters): Promise<ICategoryAdminResponse> { 
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}`, { 
                params: filters 
            });
            
            return response.data; 
        } catch (error) {
            handleAxiosError(error, "Failed to fetch categories/subcategories.");
        }
    },

  async getAllSubCategories({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }) {
    try {
      const response = await axiosInstance.get(`${CATEGORIES_PATH}/getAllSubCategories`, {
        params: { page, limit, search },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "Failed to fetch subcategories.");
    }
  },

  getCommissionSummary: async (): Promise<ICommissionSummary> => {
        try {
          console.log('reaching service')
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/commission-summary`);
            return response.data.data; 
        } catch (error) {
            handleAxiosError(error, "Failed to fetch commission summary.");
            throw error;
        }
    },

    getTopLevelCategories: async (): Promise<ICategoryResponse[]> => {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/top-level`);
            return response.data.data; 
        } catch (error) {
            handleAxiosError(error, "Failed to fetch categories.");
            throw error;
        }
    },

    getPopularServices: async (): Promise<IserviceResponse[]> => {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/popular-services`);
            return response.data.data;
        } catch (error) {
            handleAxiosError(error, "Failed to fetch popular services.");
            throw error;
        }
    },

    getTrendingServices: async (): Promise<IserviceResponse[]> => {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/trending-services`);
            return response.data.data;
        } catch (error) {
            handleAxiosError(error, "Failed to fetch trending services.");
            throw error;
        }
    },

    getRelatedServices: async (serviceId: string) => {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/${serviceId}/related`);
            return response.data.data;
        } catch (error) {
            console.error("Failed to fetch related services", error);
            return [];
        }
    },
};

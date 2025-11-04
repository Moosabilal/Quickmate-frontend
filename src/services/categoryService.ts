import axiosInstance from "../lib/axiosInstance";
import { handleAxiosError } from "../util/interface/helperFunction/handleError";
import {
  ICategoryDetailsPageData,
  ICategoryResponse,
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

  async getAllCategories(): Promise<ICategoryResponse[] | undefined> {
    try {
      const response = await axiosInstance.get(CATEGORIES_PATH);
      return response.data.categories || response.data;
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
};

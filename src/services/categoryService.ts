import axiosInstance from "../API/axiosInstance";
import {ICategoryResponse} from "../types/category"; 

const CATEGORIES_PATH = '/categories';
const CATEGORIES_TOP_LEVEL_DETAILS_PATH = '/categories/top-level-details';

export const categoryService = {


    async createCategory(formData: FormData): Promise<ICategoryResponse> {
        try {
            const response = await axiosInstance.post(CATEGORIES_PATH, formData);
            return response.data.category || response.data;
        } catch (error: any) {
            console.error("Error creating category/subcategory in service:", error);
            throw error;
        }
    },


    async getCategoryById(id: string): Promise<ICategoryResponse> {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching category/subcategory with ID ${id}:`, error);
            throw error;
        }
    },


    async updateCategory(id: string, formData: FormData): Promise<ICategoryResponse> {

        try {
            const response = await axiosInstance.put(`${CATEGORIES_PATH}/${id}`, formData);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating category/subcategory with ID ${id} in service:`, error);
            throw error;
        }
    },


    async getAllCategories(parentId?: string): Promise<ICategoryResponse[]> { 
        try {
            const params: { parentId?: string } = {}; 
            if (parentId) { 
                params.parentId = parentId; 
            }
            const response = await axiosInstance.get(CATEGORIES_PATH);
            return response.data.categories || response.data;
        } catch (error: any) {
            console.error("Error fetching categories/subcategories:", error);
            throw error;
        }
    },


    async getAllTopLevelCategoriesWithDetails(): Promise<ICategoryResponse[]> {
        try {
            const response = await axiosInstance.get(CATEGORIES_TOP_LEVEL_DETAILS_PATH);
            return response.data.categories || response.data; 
        } catch (error: any) {
            console.error("Error fetching top-level categories with details:", error);
            throw error;
        }
    },


    async deleteCategory(id: string): Promise<ICategoryResponse> {
        try {
            const response = await axiosInstance.delete(`${CATEGORIES_PATH}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error deleting category/subcategory with ID ${id}:`, error);
            throw error;
        }
    },
};
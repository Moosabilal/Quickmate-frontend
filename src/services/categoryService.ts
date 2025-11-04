import axiosInstance from "../lib/axiosInstance";
import {ICategoryDetailsPageData, ICategoryFormCombinedData, ICategoryResponse} from "../util/interface/ICategory"; 

const CATEGORIES_PATH = '/categories';

export const categoryService = {


    async createCategory(formData: FormData): Promise<ICategoryResponse> {
        try {
            
            const response = await axiosInstance.post(CATEGORIES_PATH, formData);
            return response.data.category || response.data;
        } catch (error) {
            console.error("Error creating category/subcategory in service:", error);
            return Promise.reject(error);
        }
    },


    async getCategoryById(id: string): Promise<ICategoryDetailsPageData> {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching category/subcategory with ID ${id}:`, error);
            throw error;
        }
    },

    async getCategoryForBooking(id: string): Promise<ICategoryDetailsPageData> {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/categoryForBooking${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching category/subcategory with ID ${id}:`, error);
            throw error;
        }
    },

    getCategoryForEditAndShow: async (categoryId: string): Promise<ICategoryFormCombinedData> => {
        try {

            const response = await axiosInstance.get(`${CATEGORIES_PATH}/edit/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category for edit:', error);
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


    async getAllCategories(): Promise<ICategoryResponse[]> { 
        try {
            const response = await axiosInstance.get(CATEGORIES_PATH);
            return response.data.categories || response.data;
        } catch (error: any) {
            console.error("Error fetching categories/subcategories:", error);
            throw error;
        }
    },


    async getAllSubCategories({page, limit, search}:{page: number, limit: number, search: string}){
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/getAllSubCategories`, {
                params: { page, limit, search}
            })
            return response.data
        } catch (error) {
            console.log('error in getAllSubCategories', error)
            throw error
        }
    }
};
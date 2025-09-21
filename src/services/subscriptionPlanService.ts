import axiosInstance from "../API/axiosInstance";
import { IPlan } from "../util/interface/ISubscriptionPlan";


const SUBSCRIPTIONPLAN_URL = `/subscriptionPlan`

export const subscriptionPlanService = {
    createSubscriptionPlan: async (data: Partial<IPlan>) => {
        try {
            const response = await axiosInstance.post(`${SUBSCRIPTIONPLAN_URL}/createSubscriptionPlan`, {...data})
            return response.data
        } catch (error) {
            throw error;
        }
    },

    getSubscriptionPlan: async () => {
        try {
            const response = await axiosInstance.get(`${SUBSCRIPTIONPLAN_URL}/getSubscriptionPlan`)
            return response.data
        } catch (error) {
            throw error;
        }
    },

    updateSubscriptionPlan: async (data: IPlan) => {
        try {
            const response = await axiosInstance.put(`${SUBSCRIPTIONPLAN_URL}/updateSubscriptionPlan`, {...data})
            return response.data
        } catch (error) {
            throw error;
        }
    },

    deleteSubscriptionPlan: async (id: string) => {
        try {
            const response = await axiosInstance.delete(`${SUBSCRIPTIONPLAN_URL}/deleteSubscriptionPlan/${id}`)
            return response.data
        } catch (error) {
            throw error;
        }
    }
}
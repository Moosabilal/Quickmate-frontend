import axiosInstance from "../lib/axiosInstance";
import { IPlan } from "../util/interface/ISubscriptionPlan";
import { handleAxiosError } from "../util/helperFunction/handleError";

const SUBSCRIPTIONPLAN_URL = `/subscriptionPlan`;

export const subscriptionPlanService = {

    createSubscriptionPlan: async (data: Partial<IPlan>) => {
        try {
            const response = await axiosInstance.post(`${SUBSCRIPTIONPLAN_URL}/createSubscriptionPlan`, { ...data });
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to create subscription plan.");
        }
    },

    getSubscriptionPlan: async (search?: string) => {
        try {
            const response = await axiosInstance.get(`${SUBSCRIPTIONPLAN_URL}/getSubscriptionPlan`, {params: {search}});
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to fetch subscription plans.");
        }
    },

    updateSubscriptionPlan: async (data: IPlan) => {
        try {
            const response = await axiosInstance.put(`${SUBSCRIPTIONPLAN_URL}/updateSubscriptionPlan`, { ...data });
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to update subscription plan.");
        }
    },

    deleteSubscriptionPlan: async (id: string) => {
        try {
            const response = await axiosInstance.delete(`${SUBSCRIPTIONPLAN_URL}/deleteSubscriptionPlan/${id}`);
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to delete subscription plan.");
        }
    },

    createSubscriptionOrder: async (providerId: string, planId: string) => {
        try {
            const response = await axiosInstance.post(`${SUBSCRIPTIONPLAN_URL}/create-order`, { providerId, planId });
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to create subscription order.");
        }
    },

    calculateUpgrade: async (planId: string) => {
        try {
            // providerId is handled by the backend's AuthRequest
            const response = await axiosInstance.post(`${SUBSCRIPTIONPLAN_URL}/calculate-upgrade`, { newPlanId: planId });
            return response.data.data; // Returns { order, newPlan, finalAmount, ... }
        } catch (error) {
            handleAxiosError(error, "Failed to calculate upgrade cost.");
            throw error;
        }
    },

    verifySubscriptionPayment: async (
        providerId: string,
        planId: string,
        razorpay_order_id: string,
        razorpay_payment_id: string,
        razorpay_signature: string
    ) => {
        try {

            console.log('the payment verification details', providerId)
            console.log(planId)
            console.log(razorpay_order_id)
            console.log(razorpay_payment_id)
            console.log(razorpay_signature)

            const response = await axiosInstance.post(`${SUBSCRIPTIONPLAN_URL}/verify-payment`, {
                providerId,
                planId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });
            return response.data;
        } catch (error) {
            handleAxiosError(error, "Failed to verify subscription payment.");
        }
    },
};

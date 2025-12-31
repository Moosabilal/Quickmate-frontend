import axiosInstance from "../lib/axiosInstance"
import { handleAxiosError } from "../util/helperFunction/handleError"
import { TransactionStatus } from "../util/interface/IPayment"

const WALLET_URL = `/wallet`

export const walletService = {

    getWallet: async (filters?: string) => {
        try {
            const response = await axiosInstance.get(`${WALLET_URL}?${filters}`)
            return response.data
        } catch (error) {
            handleAxiosError(error, "Failed to fetch wallet details.")
        }
    },

    initiateDeposit: async (amount: number) => {
        try {
            const response = await axiosInstance.post(`${WALLET_URL}/deposit/initiate`, { amount })
            return response.data
        } catch (error) {
            handleAxiosError(error, "Failed to initiate wallet deposit.")
        }
    },

    verifyDeposit: async (
        razorpay_order_id: string,
        razorpay_payment_id: string,
        razorpay_signature: string,
        amount: number,
        description: string,
        status: TransactionStatus,
        transactionType: string
    ) => {
        try {
            const response = await axiosInstance.post(`${WALLET_URL}/deposit/verify`, {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                description,
                amount,
                status,
                transactionType,
            })
            return response.data
        } catch (error) {
            handleAxiosError(error, "Failed to verify wallet deposit.")
        }
    },
}

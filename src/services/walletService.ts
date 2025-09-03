import axiosInstance from "../API/axiosInstance"

const WALLET_URL = `/wallet`

export const walletService = {
    getWallet: async () => {
        try {
            const response = await axiosInstance.get(`${WALLET_URL}`)
            return response.data
        } catch (error) {
            console.log('Error in getting wallet', error)
            throw error
        }
    },

    initiateDeposit: async (amount: number) => {
        try {
            const response = await axiosInstance.post(`${WALLET_URL}/deposit/initiate`, {amount})
            return response
        } catch (error) {
            console.log('Error in initiating amount deposit', error)
            throw error
        }
    },

    verifyDeposit: async (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, amount: number) => {
        try {
            const response = await axiosInstance.post(`${WALLET_URL}/deposit/verify`, {
                razorpay_order_id, 
                razorpay_payment_id, 
                razorpay_signature, 
                amount
            })

            return response.data
            
        } catch (error) {
            console.log('Error in verifying deposit amount', error)
            throw error
        }
    }
}
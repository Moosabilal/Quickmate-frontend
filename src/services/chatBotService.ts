import axiosInstance from "../lib/axiosInstance";
import { isAxiosError } from "axios";
import { handleAxiosError } from "../util/helperFunction/handleError";
import { ChatbotMessage, IChatbotResponse, IChatHistoryMessage, IChatPaymentVerify } from "../util/interface/IChatBot";

const CHATBOT_URL = '/chatbot';
const SESSION_ID_KEY = 'chatbot_session_id';

export const chatbotService = {
    startOrGetSession: async (userId?: string): Promise<string> => {
        const storedSessionId = localStorage.getItem(SESSION_ID_KEY);
        
        if (storedSessionId) {
            return storedSessionId;
        }
        
        try {
            const response = await axiosInstance.post(`${CHATBOT_URL}/session`, { userId });
            
            const newSessionId = response.data.sessionId;

            if (typeof newSessionId !== 'string' || !newSessionId) {
                throw new Error("Failed to retrieve a valid session ID from the server.");
            }

            localStorage.setItem(SESSION_ID_KEY, newSessionId);
            return newSessionId;
            
        } catch (error) {
            console.error("Failed to start chat session:", error);
            throw error;
        }
    },

    getHistory: async (sessionId: string): Promise<ChatbotMessage[]> => {
        try {
            const response = await axiosInstance.get(`${CHATBOT_URL}/session/${sessionId}`);
            
            return response.data.history.map((msg: IChatHistoryMessage) => ({
                ...msg,
                timestamp: new Date(msg.createdAt),
                role: msg.role === 'user' ? 'user' : 'model' 
            }));
        } catch (error) {
            console.error("Failed to get chat history:", error);
            throw error;
        }
    },

    sendMessage: async (sessionId: string, text: string): Promise<IChatbotResponse> => {
        try {
            const response = await axiosInstance.post(`${CHATBOT_URL}/session/${sessionId}/message`, { text });
                        
            return response.data.response; 
        } catch (error) {
            if (isAxiosError(error) && error.response && error.response.status === 404) {
                console.warn("Stale chat session ID detected. Clearing from localStorage.");
                localStorage.removeItem(SESSION_ID_KEY);
                throw new Error("Chat session expired. Please refresh the page.");
            }
            
            console.error("Failed to send message:", error);
            throw error;
        }
    },

    verifyChatPayment: async (sessionId: string, data: IChatPaymentVerify) => {
        try {
            const response = await axiosInstance.post(`${CHATBOT_URL}/verify-chat-payment/${sessionId}`, data);
            return response.data; 
        } catch (error) {
            handleAxiosError(error, "Failed to verify chat payment.");
            throw error;
        }
    },

    clearSession: (): void => {
        localStorage.removeItem(SESSION_ID_KEY);
    }
};
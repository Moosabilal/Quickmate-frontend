import axiosInstance from "../lib/axiosInstance";
import { ChatbotMessage, IChatbotResponse } from "../util/interface/IChatBot";

const CHATBOT_URL = '/chatbot';
const SESSION_ID_KEY = 'chatbot_session_id';

export const chatbotService = {
    startOrGetSession: async (userId?: string): Promise<string> => {
        const storedSessionId = localStorage.getItem(SESSION_ID_KEY);
        if (storedSessionId) {
            return storedSessionId;
        }
        
        try {
            const response = await axiosInstance.post(`${CHATBOT_URL}/session/${userId}`);
            console.log('respones session id', response.data)
            
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
            return response.data.history.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.createdAt)
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
            console.error("Failed to send message:", error);
            throw error;
        }
    }
};
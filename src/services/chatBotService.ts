// import axiosInstance from "../lib/axiosInstance";
// import { ChatbotMessage, IChatbotResponse } from "../util/interface/IChatBot";

// const CHATBOT_URL = '/chatbot';
// const SESSION_ID_KEY = 'chatbot_session_id';

// export const chatbotService = {
//     startOrGetSession: async (userId?: string): Promise<string> => {
//         const storedSessionId = localStorage.getItem(SESSION_ID_KEY);
//         if (storedSessionId) {
//             return storedSessionId;
//         }
        
//         try {
//             const response = await axiosInstance.post(`${CHATBOT_URL}/session`, {userId});
            
//             const newSessionId = response.data.sessionId;

//             if (typeof newSessionId !== 'string' || !newSessionId) {
//                 throw new Error("Failed to retrieve a valid session ID from the server.");
//             }

//             localStorage.setItem(SESSION_ID_KEY, newSessionId);
//             return newSessionId;
            
//         } catch (error) {
//             console.error("Failed to start chat session:", error);
//             throw error;
//         }
//     },

//     getHistory: async (sessionId: string): Promise<ChatbotMessage[]> => {
//         try {
//             const response = await axiosInstance.get(`${CHATBOT_URL}/session/${sessionId}`);
//             return response.data.history.map((msg: any) => ({
//                 ...msg,
//                 timestamp: new Date(msg.createdAt)
//             }));
//         } catch (error) {
//             console.error("Failed to get chat history:", error);
//             throw error;
//         }
//     },

//     sendMessage: async (sessionId: string, text: string): Promise<IChatbotResponse> => {
//         try {
//             const response = await axiosInstance.post(`${CHATBOT_URL}/session/${sessionId}/message`, { text });
//             return response.data.response;
//         } catch (error) {
//             console.error("Failed to send message:", error);
//             throw error;
//         }
//     }
// };


import axiosInstance from "../lib/axiosInstance";
import { ChatbotMessage, IChatbotResponse } from "../util/interface/IChatBot";

const CHATBOT_URL = '/chatbot';
const SESSION_ID_KEY = 'chatbot_session_id';

export const chatbotService = {
    /**
     * Gets the current session ID from localStorage or creates a new one.
     * If a userId is provided, it will be sent to the backend to link the session.
     */
    startOrGetSession: async (userId?: string): Promise<string> => {
        const storedSessionId = localStorage.getItem(SESSION_ID_KEY);
        
        // If we have a stored session, just return it (unless you want to force validation)
        if (storedSessionId) {
            return storedSessionId;
        }
        
        try {
            // Create a new session
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

    /**
     * Fetches the message history for a given session ID.
     */
    getHistory: async (sessionId: string): Promise<ChatbotMessage[]> => {
        try {
            const response = await axiosInstance.get(`${CHATBOT_URL}/session/${sessionId}`);
            
            // Map backend message format to frontend ChatbotMessage format
            return response.data.history.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.createdAt),
                // Ensure role is strictly 'user' or 'model'
                role: msg.role === 'user' ? 'user' : 'model' 
            }));
        } catch (error) {
            console.error("Failed to get chat history:", error);
            throw error;
        }
    },

    /**
     * Sends a new user message to the chatbot and gets the response.
     */
    sendMessage: async (sessionId: string, text: string): Promise<IChatbotResponse> => {
        try {
            const response = await axiosInstance.post(`${CHATBOT_URL}/session/${sessionId}/message`, { text });
            
            // Check for the special 404 error which means the session is invalid
            // Note: axiosInstance might have intercepted this already, but this is a safety check
            
            return response.data.response;
        } catch (error: any) {
            // Handle session expiry specifically if needed
            if (error.response && error.response.status === 404) {
                console.warn("Stale chat session ID detected. Clearing from localStorage.");
                localStorage.removeItem(SESSION_ID_KEY);
                throw new Error("Chat session expired. Please refresh the page.");
            }
            
            console.error("Failed to send message:", error);
            throw error;
        }
    },

    /**
     * checks the status of a session
     */
    getSessionStatus: async (sessionId: string): Promise<any> => {
        try {
            const response = await axiosInstance.get(`${CHATBOT_URL}/session/${sessionId}/status`);
            return response.data.session;
        } catch (error) {
            console.error('Failed to get session status:', error);
            throw error;
        }
    },

    /**
     * Clears the current session from local storage.
     */
    clearSession: (): void => {
        localStorage.removeItem(SESSION_ID_KEY);
    }
};
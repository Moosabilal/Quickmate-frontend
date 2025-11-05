import axiosInstance from "../lib/axiosInstance";

export const fileService = {
    uploadChatFile: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('chatFile', file);

        try {
            const response = await axiosInstance.post('/messages/upload-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }
};
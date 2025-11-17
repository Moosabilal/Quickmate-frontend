import axiosInstance from "../lib/axiosInstance";

export const fileService = {
    uploadChatFile: async (file: File): Promise<{ url: string }> => {
        // Validate file before upload
        const maxSizeMB = 10;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];

        if (!file) {
            throw new Error('No file selected');
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            throw new Error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum limit of ${maxSizeMB}MB`);
        }

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`File type ${file.type} not supported. Allowed types: ${allowedTypes.join(', ')}`);
        }

        const formData = new FormData();
        formData.append('chatFile', file);

        try {
            console.log(`Uploading file: ${file.name}, size: ${fileSizeMB.toFixed(2)}MB, type: ${file.type}`);

            const response = await axiosInstance.post('/messages/upload-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60 second timeout
            });

            console.log('File upload successful:', response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error uploading file:", error);

            // Extract meaningful error message from response
            let errorMessage = 'Failed to upload file';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Upload timeout - please try again';
            }

            throw new Error(errorMessage);
        }
    }
};

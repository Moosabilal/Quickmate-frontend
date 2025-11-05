const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
console.log('the cloud bame', CLOUD_NAME)
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`;

/**
 * @param publicId The file path/id (e.g., "v176.../file.jpg")
 * @param resourceType 'image' for photos, 'raw' for files like .txt, .pdf
 */
export const getCloudinaryUrl = (
  publicId: string,
  resourceType: 'image' | 'raw' = 'image' // Default to 'image'
): string => {
  if (!publicId) return '';
  
  // For raw files, the URL structure is /raw/upload/
  if (resourceType === 'raw') {
    return `${BASE_URL}/raw/upload/${publicId}`;
  }
  
  // For images, the URL is /image/upload/
  return `${BASE_URL}/image/upload/${publicId}`;
};

/**
 * @description Creates a URL that forces the browser to download the file.
 * @param publicId The file path/id (e.g., "v176.../file.txt")
 */
export const getCloudinaryDownloadUrl = (publicId: string): string => {
    if (!publicId) return '';
    // The "fl_attachment" flag tells Cloudinary to send this as a download.
    return `${BASE_URL}/raw/upload/fl_attachment/${publicId}`;
};
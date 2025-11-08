const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
console.log('the cloud bame', CLOUD_NAME)
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`;

export const getCloudinaryUrl = (
  publicId: string,
  resourceType: 'image' | 'raw' = 'image' 
): string => {
  if (!publicId) return '';
  
  if (resourceType === 'raw') {
    return `${BASE_URL}/raw/upload/${publicId}`;
  }
  
  return `${BASE_URL}/image/upload/${publicId}`;
};

export const getCloudinaryDownloadUrl = (publicId: string): string => {
    if (!publicId) return '';
    return `${BASE_URL}/raw/upload/fl_attachment/${publicId}`;
};
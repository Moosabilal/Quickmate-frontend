const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
console.log('the cloud bame', CLOUD_NAME)
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`;

export const getCloudinaryUrl = (
  pathOrId: string,
  resourceType: 'image' | 'raw' = 'image'
): string => {
  if (!pathOrId) return '';

  if (pathOrId.startsWith('blob:') || pathOrId.startsWith('http')) {
      return pathOrId;
  }

  const BASE_URL = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}`;
  const type = 'authenticated';
  
  return `${BASE_URL}/${resourceType}/${type}/${pathOrId}`;
};

export const getCloudinaryDownloadUrl = (publicId: string): string => {
    if (!publicId) return '';
    return `${BASE_URL}/raw/upload/fl_attachment/${publicId}`;
};
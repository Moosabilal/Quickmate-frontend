const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
console.log('the cloud bame', CLOUD_NAME)
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`;

export const getCloudinaryUrl = (
  pathOrId: string,
  resourceType: 'image' | 'raw' = 'image'
): string => {
  if (!pathOrId) return '';

  // 1. If it's a local preview (Blob) or already a full URL (Signed from backend)
  // RETURN IT DIRECTLY. Do not touch it.
  if (pathOrId.startsWith('blob:') || pathOrId.startsWith('http')) {
      return pathOrId;
  }

  // 2. If it is just a Public ID, we can't really sign it here. 
  // You might want to return a placeholder or try the old way (which might fail 401)
  // Ideally, the backend should always send the full URL now.
  
  // Fallback for non-strict assets:
  const BASE_URL = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}`;
  const type = 'authenticated'; // You might need to change 'upload' to 'authenticated' in the path
  
  return `${BASE_URL}/${resourceType}/${type}/${pathOrId}`;
};

export const getCloudinaryDownloadUrl = (publicId: string): string => {
    if (!publicId) return '';
    return `${BASE_URL}/raw/upload/fl_attachment/${publicId}`;
};
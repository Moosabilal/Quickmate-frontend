const BASE = import.meta.env.VITE_CLOUDINARY_BASE_URL;
export const getCloudinaryUrl = (path: string) => `${BASE}/${path}`;
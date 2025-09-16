export interface IAddAndEditServiceForm {
    id?: string;
    title: string;
    description: string;
    experience: number;
    categoryId: string;
    subCategoryId: string | null;
    duration: string,
    priceUnit: 'PerHour' | 'PerService';
    providerId: string;
    status: boolean;
    price: number;
    businessCertification?: string | File;
    categoryName?: string;
}
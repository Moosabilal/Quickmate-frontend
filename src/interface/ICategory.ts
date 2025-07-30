import { Types, Document } from 'mongoose';

export interface ICategoryInput {
    name: string;
    description?: string | null; 
    parentid?: string | Types.ObjectId | null; 
    status?: boolean;
    icon?: string | null; 
}

export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | null; 
    parentid?: Types.ObjectId | null; 
    status: boolean; 
    icon?: string | null; 
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategoryResponse extends Omit<ICategoryInput, 'parentid'> {
    _id: string;
    parentId?: string | null; 
    createdAt: string; 
    updatedAt: string;
    iconUrl: string; 
    subCategoryCount?: number | undefined; 
    commissionStatus: boolean,
    commissionType: string | null,
    commissionValue: number | null 
    subCategories?: ICategoryResponse[]; 
}

export interface ICommissionRuleInput {
    categoryid?: string | null; 
    globalCommission?: number; 
    flatFee?: number; 
    categoryCommission?: number; 
    status?: boolean; 
}


export interface ICommissionRuleResponse extends Omit<ICommissionRuleInput, 'categoryid'> {
    _id: string; 
    categoryid?: string | null; 
    createdAt: string;
    updatedAt: string;
}

export interface ICategoryFormCombinedData {
    _id?: string; 
    name: string;
    description: string;
    iconUrl?: string | null; 
    status: boolean; 
    parentid?: string | null; 

    commissionType: 'percentage' | 'flatFee' | 'none'; 
    commissionValue: number | '';
    commissionStatus: boolean; 
}

export interface ISubcategoryFormFetchData {
    _id: string;
    name: string;
    description: string;
    iconUrl?: string | null;
    status: boolean;
    parentid?: string | null; 
}

export interface IserviceResponse {
    id: string;
    name: string;
    iconUrl?: string | null;
    parentId?: string | null
}
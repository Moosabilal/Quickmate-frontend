import { Types, Document } from 'mongoose';

export const enum CommissionTypes {
    PERCENTAGE = "Percentage",
    FLATFEE = "FlatFee",
    NONE = "None"
}

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
    categoryDetails(categoryDetails: any): unknown;
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
    commissionType: CommissionTypes;
    status?: boolean; 
}


export interface ICommissionRuleResponse extends Omit<ICommissionRuleInput, 'categoryid'> {
    _id: string; 
    categoryid?: string | null; 
    createdAt: string;
    updatedAt: string;
}

export interface ICategoryFormCombinedData {
    id?: string; 
    name: string;
    description: string;
    iconUrl?: string | null; 
    status: boolean; 
    parentId?: string | null; 

    commissionType: CommissionTypes; 
    commissionValue: number | '';
    commissionStatus: boolean; 
}

export interface ICategoryDetailsPageData {
    categoryDetails: ICategoryFormCombinedData;
    subCategories: ICategoryFormCombinedData[];
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

export interface ICategoryData {
    id: string;
    name: string;
    parentId?: string;
}

export interface ISubCategory {
    _id: string;
    name: string;
    description: string;
    iconUrl: string | null;
    status: boolean;
    parentId: string | null;
}

export interface ICategoryFormData {
    name: string;
    description: string;
    status: boolean;
    commissionType: CommissionTypes;
    commissionValue: number | '';
    commissionStatus: boolean;
    icon: File | string | null;
}

export interface CategoryTableDisplay extends ICategoryResponse {
    subCategoriesCount?: number | undefined;
    commissionRule?: ICommissionRuleResponse | null;
}
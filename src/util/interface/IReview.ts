import { JSX } from "react";

export enum ReviewStatus {
    ALL = 'All',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    PENDING = 'Pending',
    REMOVED = 'Removed',
}

export interface IReviewAdminFilters {
    page?: number;
    limit?: number;
    search?: string;
    rating?: number;
    sort?: 'newest' | 'oldest';
    status?: ReviewStatus;
}

export interface ReviewData {
    id: string;
    user: {id: string; name: string; isVerified?: boolean; };
    provider: {id: string; name: string; };
    reviewContent: string;
    rating: number;
    date: string;
    status: string;
}

export type StatusConfig = {
    bg: string;
    icon: JSX.Element;
    label: string;
};
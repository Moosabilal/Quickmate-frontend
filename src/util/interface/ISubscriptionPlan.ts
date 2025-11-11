import { IRazorpayOrder } from "./IUser";

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  NONE = "NONE"
}
export interface IPlan {
  id?: string;          
  _id?: string;       
  name: string;
  price: number | null; 
  durationInDays: number | null;
  features: string[];
  createdAt?: string;
  updatedAt?: string;
  recommended?: boolean;
}

export interface ISubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  recommended?: boolean;
}

export interface ISubscription {
  planId?: string;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
}

export interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  subscriptionPlans?: ISubscriptionPlan[];
}

export interface IUpgradeCostResponse {
  order: IRazorpayOrder;
  newPlan: IPlan; 
  oldPlanValue: number;
  newPlanPrice: number;
  finalAmount: number;
}

export interface UpgradeModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: IPlan | ISubscriptionPlan;
  details: {
    oldPlanValue: number;
    newPlanPrice: number;
    finalAmount: number;
  };
}
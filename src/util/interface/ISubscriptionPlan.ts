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
  pendingDowngradePlanId?: string;
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

export type ModalActionType = 'upgrade' | 'downgrade' | 'cancelDowngrade';


export interface ModalConfig {
  type: ModalActionType;
  title: string;
  confirmText: string;
  icon: React.ReactNode;
  iconBg: string;
  confirmBg: string;
  confirmHoverBg: string;
  message?: React.ReactNode; 
}

export interface SubscriptionActionModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: ModalActionType;
  plan?: IPlan; 
  details?: Omit<IUpgradeCostResponse, 'order' | 'newPlan'>; 
}


export type ActiveModalState = {
  type: ModalActionType;
  plan?: IPlan;
  details?: Omit<IUpgradeCostResponse, 'order' | 'newPlan'>;
  order?: IRazorpayOrder; 
  newPlan?: IPlan;
}
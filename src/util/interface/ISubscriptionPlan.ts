export interface IPlan {
  id?: string;
  name: string;
  price: number | null;
  durationInDays: number | null;
  features: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  recommended?: boolean;
}

export interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  subscriptionPlans?: ISubscriptionPlan[];
}

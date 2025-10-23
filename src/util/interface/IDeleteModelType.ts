export enum DeleteConfirmationTypes {
    SERVICE = "service",
    BOOKING = "booking",
    PORTFOLIO = "portfolio",
    PROFILE = "profile",
    REVIEW = "review",
    CERTIFICATE = "certificate",
    SUBSCRIPTION = "subscriptionPlan",
    LOGOUT = "logout",
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: DeleteConfirmationTypes;
  itemName?: string;
  itemDetails?: string;
  isLoading?: boolean;
  customMessage?: string;
  additionalInfo?: string;
  confirmTextProp?: string;
  titleProp?: string;
}
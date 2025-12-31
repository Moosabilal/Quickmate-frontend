export type ReviewAction = 'approve' | 're-approve' | 'reject' | 'ban' | 'unban';

export interface ModalConfig {
  title: string;
  message: string;
  warning: string;
  confirmText: string;
  icon: React.ReactNode;
  iconBg: string;
  confirmBg: string;
  confirmHoverBg: string;
  confirmIcon: React.ReactNode;
}

export interface ReviewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  action: ReviewAction;
  itemName?: string;
  itemDetails?: string; 
}
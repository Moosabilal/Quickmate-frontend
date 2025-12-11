export enum PaymentMethod {
    CARD = "Card",
    WALLET = "Wallet",
    UPI = "UPI",
    BANK = "Bank"

}

export enum TransactionStatus {
    ALL = "All",
    REFUND = "Refund",
    DEPOSIT = "Deposit",
    WITHDRAWN = "Withdrawn",
    PAYMENT = "Payment"

}

export interface WalletFilter {
    status?: TransactionStatus | '',
    startDate?: string;
    transactionType?: "credit" | "debit" | "",
    page?: number,
    limit?: number
}

export interface paymentVerificationRequest {
    providerId: string,
    bookingId: string,
    paymentMethod: PaymentMethod,
    paymentDate: Date,
    amount: number,    
    razorpay_order_id?: string, 
    razorpay_payment_id?: string, 
    razorpay_signature?: string,
}

export interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  description: string;
  transactionType: string;
  status: TransactionStatus;
};

export interface ITransaction {
  _id: string;
  walletId: string;
  transactionType: 'credit' | 'debit';
  source: string;
  remarks: string;
  description?: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

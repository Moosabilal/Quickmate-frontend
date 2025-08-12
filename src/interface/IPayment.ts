export enum PaymentMethod {
    CARD = "Card",
    WALLET = "Wallet",
    UPI = "UPI",
    BANK = "Bank"

}

export interface paymentVerificationRequest {
    providerId: string,
    bookingId: string,
    paymentMethod: PaymentMethod,
    paymentDate: Date,
    amount: number,    
    razorpay_order_id: string, 
    razorpay_payment_id: string, 
    razorpay_signature: string,
}
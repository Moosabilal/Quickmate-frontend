export enum PaymentStatus {
    PAID = "Paid",
    UNPAID = "UnPaid",
    REFUNDED = "Refunded"
}

export enum BookingStatus {
    All = "All",
    PENDING = "Pending",
    CONFIRMED = "Confirmed",
    CANCELLED = "Cancelled",
    COMPLETED = "Completed",
    IN_PROGRESS = "In-Progress"
}

export interface LocationState {
  email?: string;
  role?: string;
  bookingId?: string;
  newStatus?: BookingStatus;
}

export interface IBookingRequest {
  serviceId: string;
  providerId: string;
  customerName: string;
  phone: string;
  instructions?: string;
  addressId?: string
  // scheduledDate?: string;
  // scheduledTime?: string;
}


export interface IBookingConfirmationPage {
  id: string;
  bookedOrderId: string;
  serviceName: string;
  serviceImage?: string;
  providerName?: string;
  providerImage?: string;
  priceUnit?: string;
  duration?: string;
  customer?: string;
  phone: string;
  date: string;
  time: string;
  address: {
    label: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialInstruction: string;
  providerTimings?: { day: string; startTime: string; endTime: string }[];
  createdAt: Date;
}

export interface IBookingHistoryPage {
  id: string;
  serviceName: string;
  serviceImage: string;
  providerName: string;
  providerImage: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  location: string;
  priceUnit: string;
  duration?: string;
  description?: string;
  createdAt?: Date;
}
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

export interface IBookingStatusCounts {
  [BookingStatus.All]: number;
  [BookingStatus.PENDING]: number;
  [BookingStatus.CONFIRMED]: number;
  [BookingStatus.IN_PROGRESS]: number;
  [BookingStatus.COMPLETED]: number;
  [BookingStatus.CANCELLED]: number;
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
  reviewed: boolean;
  rating: number;
  review: string;
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

export interface IProviderBookingManagement {
  id: string;
  customerId?: string;
  customerName: string;
  customerImage: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  payment: number;
  paymentStatus: string;
  status: BookingStatus;
  description: string;
  customerPhone: string;
  customerEmail: string;
  specialRequests: string;
  createdAt: string;
  // rating: number | null;
}

export interface IAdminBookingFilters {
  page: number;
  limit: number;
  search?: string;
  bookingStatus?: string;
  serviceType?: string;
  dateRange?: string;
}

export interface IBookingLog {
  id: string;
  userName: string;
  userAvatar: string;
  providerName: string;
  serviceType: string;
  dateTime: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
}

export interface IAdminBookingsResponse {
  bookings: IBookingLog[];
  totalPages: number;
  currentPage: number;
  totalBookings: number;
}

export interface IApiSlot {
  start: string;
  end: string;
}

export interface IApiProviderAvailability {
  providerId: string;
  providerName: string;
  availableSlots: IApiSlot[];
}

export interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  serviceId?: string;
  radius?: number;
  onSlotSelect: (date: string, time: string) => void;
}


export interface DateTimePopupProps {
  dateTimePopup: boolean;
  setDateTimePopup: (value: boolean) => void;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  selectedTime: string;
  setSelectedTime: (value: string) => void;
  timeSlots?: string[];
  handleDateTimeConfirm: (date: string, time: string) => void;
  providersTimings?: { day: string; startTime: string; endTime: string }[];
}
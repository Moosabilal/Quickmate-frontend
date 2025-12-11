import { JSX } from "react";
import { BookingStatus } from "./IBooking";

export interface GoogleCalendarTokens {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}


export interface IUser {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified?: boolean; 
    profilePicture?: string;
    googleCalendar?: {
        tokens: GoogleCalendarTokens
    }
}

export interface IBookingDetailsForAdmin {
    id: string;
    providerName: string;
    service: string;
    bookingDate: string;
    serviceDate: string;
    status: BookingStatus;
}

export interface IUserDetailsResponse {
    id: string;
    name: string;
    avatarUrl: string;
    email: string;
    phone: string;
    registrationDate: string;
    lastLogin: string;
    isActive: boolean;
    totalBookings: number;
    bookingStats: {
        completed: number;
        canceled: number;
        pending: number;
    };
    bookingHistory: IBookingDetailsForAdmin[];
}

export type RenderableStatus = 
    | BookingStatus.PENDING
    | BookingStatus.CONFIRMED
    | BookingStatus.CANCELLED
    | BookingStatus.COMPLETED
    | BookingStatus.IN_PROGRESS;

export type StatusStyle = {
    bgColor: string;
    textColor: string;
    icon: JSX.Element;
};

export interface AuthState {
    user: IUser | null;
    isAuthenticated: boolean;
}

export interface ValidationErrors {
    email?: string;
    password?: string;
}

export interface FormTouched {
    email: boolean;
    password: boolean;
}

export interface ValidationErrorsForReset {
  newPassword?: string;
  confirmNewPassword?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  phone: string;
  bookings: number;
}

export interface RegistrationValidationErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export interface RegistrationFormTouched {
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
}

export interface IRazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string | number> | [];
  offer_id: string | null;
  created_at: number;
}

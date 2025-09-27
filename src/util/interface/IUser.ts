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
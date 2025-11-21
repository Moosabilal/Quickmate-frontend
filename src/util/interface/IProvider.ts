import React from "react";
import { BookingStatus } from "./IBooking";
import { SubscriptionStatus } from "./ISubscriptionPlan";

export enum ProviderStatus {
  Active = 'Approved',
  InActive = 'Rejected',
  Suspended = 'Suspended',
  Pending = 'Pending',
}

export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IProvider {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  availability: Availability[];
  specialty?: string;
  experience?: string;
  location?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  description?: string;
}

export interface IFeaturedProviders {
  id: string;
  userId: string;
  fullName: string;
  profilePhoto: string;
  serviceName: string;
  rating: number;

}

export interface IProviderProfile {

  aadhaarIdProof: string;
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceLocation: string;
  serviceArea: string;
  experience: number
  profilePhoto: string;
  status: string;
  availability?: {
    weeklySchedule: DaySchedule[];
    dateOverrides: DateOverride[];
    leavePeriods: LeavePeriod[];
  };
  earnings?: number;
  totalBookings?: number;
  payoutPending?: number;
  rating?: number;
  isVerified?: boolean
  subscription?: {
    planId?: string;
    startDate: Date;
    endDate: Date;
    status: SubscriptionStatus
  };
  createdAt?: Date;


}

export interface IReviewOfUser {
  userName: string;
  userImg: string;
  rating: number;
  review: string;
}

export interface IBackendProvider {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profilePhoto: string;
  serviceName?: string;
  serviceArea: string;
  serviceLocation: string;
  experience: number;
  availability: IAvailabilityUpdateData;
  status: string;
  earnings: number;
  price: number;
  totalBookings: number;
  rating?: number;
  reviews?: IReviewOfUser[];
}



export interface IProviderForChatListPage {
  id: string;
  bookingId?: string;
  name: string;
  profilePicture: string;
  location: string;
  isOnline: boolean;
  services: string;
  lastMessage: string | null; 
  messageType: 'text' | 'image' | 'file';
  lastMessageSenderId: string | null; 
  lastMessageAt?: Date | null;
}

//for admin side
export interface ProviderList {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceId: string;
  serviceArea: string;
  profilePhoto: string;
  serviceOffered: string[];
  status: ProviderStatus;
  rating?: number;
}

export interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

export interface RatingPoint {
  month: string;
  rating: number;
}

export interface Booking {
  id: number;
  service: string;
  client: string;
  status: 'upcoming' | 'scheduled' | 'completed' | 'cancelled';
  image: string;
  category: string;
}

export interface StatData {
  toFixed: any;
  current: number;
  previous: number;
  change: number;
}

export interface Stats {
  ratingHistory: never[];
  earnings: StatData;
  completedJobs: StatData;
  upcomingBookings: StatData;
  averageRating: StatData;
}


export interface IDashboardResponse {
  id: string;
  service: string;
  client: string;
  status: BookingStatus;
  image: string;
  category: string;

}

export interface RatingHistoryPoint {
  month: string;
  rating: number;
}

export interface IDashboardStatus {
  earnings: number;
  completedJobs: number;
  upcomingBookings: number;
  averageRating?: number;
  ratingHistory?: RatingHistoryPoint[]
}

export type FilterParams = {
  experience: number;
  price: number;
  radius: number;
  latitude: number;
  longitude: number;
  date: string | null
  time: string | null
  
};

export interface EarningsBreakdownItem {
  date: string; 
  service: string;
  client: string;
  amount: number;
  status: string;
}

export interface EarningsAnalyticsData {
  totalEarnings: number;
  earningsChangePercentage: number;
  totalClients: number;
  newClients: number;
  topService: {
    name: string;
    earnings: number;
  };
  breakdown: EarningsBreakdownItem[];
}

export interface IReview {
    name: string;
    time: string;
    rating: number;
    comment: string;
    avatar: string;
}

export interface IRatingDistribution {
    stars: number;
    percentage: number;
}

export interface IMonthlyTrend {
    month: string;
    value: number;
}

export interface IServiceBreakdown {
    serviceName: string;
    completionRate: number;
}

export interface IProviderPerformance {
    providerName: string;
    totalBookings: number;
    completedBookings: number;
    avgRating: number;
    completionRate: string;
    reviews: IReview[];
    ratingDistribution: IRatingDistribution[];
    starRatingTrend: IMonthlyTrend[];
    serviceBreakdown: IServiceBreakdown[];
}

export interface ProviderState  {
    provider: Partial<IProviderProfile>
}

export interface IEditedProviderProfile extends Partial<IProviderProfile> {
    profilePhotoFile?: File;
    aadhaarIdProofFile?: File;
}

export interface IProviderFormState {
    fullName: string;
    phoneNumber: string;
    email: string;
    serviceArea: string | null;
    serviceLocation: { lat: number; lng: number } | null;
    aadhaarIdProof: File | null;
    profilePhoto: File | null;
    agreeTerms: boolean;
}

export interface ProviderPopupProps {
  setSelectedProvider: (provider: IBackendProvider | null) => void;
  providerPopup: boolean;
  selectedProvider: IBackendProvider | null;
  setProviderPopup: (open: boolean) => void;
  serviceId: string;
  selectedDate: string | null;
  selectedTime: string | null;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface RatingTrendChartProps {
    data: IMonthlyTrend[];
}

export interface TimeSlot {
    start: string;
    end: string;
}

export interface DaySchedule {
    day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    active: boolean;
    slots: TimeSlot[];
}

export interface DateOverride {
    date: string; 
    isUnavailable: boolean;
    busySlots: TimeSlot[];
    reason?: string;
}

export interface EditDateModalProps {
    date: Date;
    onClose: () => void;
    onSave: (date: Date, isUnavailable: boolean, busySlots: TimeSlot[], reason: string) => void;
    initialOverride?: DateOverride;
}

export interface LeavePeriod {
    from: string; 
    to: string;  
    reason?: string; 
}

export interface IAvailabilityUpdateData {
    weeklySchedule: DaySchedule[];
    dateOverrides: DateOverride[];
    leavePeriods: LeavePeriod[];
}

export interface IServiceDetails {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  duration: string;
  categoryId: { name: string };
  subCategoryId: { name: string };
  experience?: number;
}

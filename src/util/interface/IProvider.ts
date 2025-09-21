import { BookingStatus } from "./IBooking";

export enum ProviderStatus {
  Active = 'Approved',
  InActive = 'Rejected',
  Suspended = 'Suspended',
  Pending = 'Pending',
}

export enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    NONE = "NONE"
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

}

export interface IProviderProfile {

  aadhaarIdProof: string;
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceId: string[];
  serviceLocation: string;
  serviceArea: string;
  experience: number
  profilePhoto: string;
  status: string;
  availability: Availability[];
  subscription?: {
    planId?: string;
    startDate: Date;
    endDate: Date;
    status: SubscriptionStatus
  }

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
  availability: Availability[];
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
  services: string;
  location: string;
  isOnline: boolean;
  // completedJobs: number;
  lastMessage?: string;
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
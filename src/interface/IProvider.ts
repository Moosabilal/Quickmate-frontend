

 export interface Availability {
    day: string;       // e.g. "Monday"
    startTime: string; // e.g. "09:00"
    endTime: string;   // e.g. "17:00"
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
  reviews?: number;
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
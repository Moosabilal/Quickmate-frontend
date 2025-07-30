
export interface IFeaturedProviders {
  id: string;
  userId: string;
  fullName: string;
  profilePhoto: string;
  serviceName: string;

}

export interface IProviderProfile {
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  verificationDocs: {
    aadhaarIdProof: string;
    businessCertifications?: string;
  }
    id: string;
    userId: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    serviceId: string;
    serviceLocation: string;
    serviceArea: string;
    experience: number
    profilePhoto: string;
    status: string;
    availableDays: string[];
  
}

export interface IBackendProvider {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profilePhoto: string;
  serviceName?: string;
  serviceArea: string;
  experience: number;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  availableDays: string[];
  status: string;
  earnings: number;
  price: number;
  totalBookings: number;
  rating?: number;
  reviews?: number;
}

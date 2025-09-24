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
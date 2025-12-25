import { TooltipProps } from "recharts";
import { IProviderProfile } from "./IProvider";

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface MonthlyTrendPoint {
  month: string;
  value: number;
}

export interface DailyPatternPoint {
  day: string;
  value: number;
}

export interface ProviderData {
  name: string;
  earnings: number;
}

export interface KpiData {
  totalBookings: number;
  activeUsers: number;
  revenue: number;
  avgRating: number;
}

export interface AnalyticsData {
  topServiceCategories: ChartDataPoint[];
  bookingTrends: MonthlyTrendPoint[];
  weeklyPattern: DailyPatternPoint[];
  topProviders: ProviderData[];
  kpi: KpiData;
}

export interface IAdminServiceDetail {
    _id: string;
    title: string;
    description?: string;
    price: number;
    priceUnit: string;
    duration?: string;
    isApproved: boolean;
    isActive: boolean;
}

export interface IAdminBookingDetail {
    _id: string;
    createdAt: string;
    scheduledDate: string; 
    customerName: string;
    status: string;
    amount: string | number;
    paymentStatus: string;
}

export interface IAdminPaymentDetail {
    _id: string;
    paymentDate: string;
    amount: number;
    adminCommission: number;
    providerAmount: number;
    status?: string;
}

export interface IProviderFullDetails {
    profile: IProviderProfile;
    services: IAdminServiceDetail[];
    bookings: IAdminBookingDetail[]; 
    payments: IAdminPaymentDetail[]; 
    stats: {
        totalEarnings: number;
        totalBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        averageRating: number;
    };
    currentPlan?: {
        _id: string;
        name: string;
        price: number;
    } | null;
}

export interface CustomTooltipProps extends TooltipProps<number, string> {
  prefix?: string;
  payload?: { name: string; value: number | string; }[];
  label?: string;
}
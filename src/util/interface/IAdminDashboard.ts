export type DailyBooking = { date: string; total: number };
export type MonthlyRevenue = { month: string; total: number };
export type TopActiveProvider = {
  _id: string;
  fullName: string;
  profilePhoto?: string;
  totalBookings?: number;
  rating?: number;
  reviewCount?: number;
};

export interface DashboardData {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  dailyBookings: DailyBooking[];
  monthlyRevenue: MonthlyRevenue[];
  topActiveProviders: TopActiveProvider[];
}
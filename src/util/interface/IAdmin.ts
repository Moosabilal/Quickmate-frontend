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
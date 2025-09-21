export interface IPlan {
  id?: string;
  name: string;
  price: number | null;
  durationInDays: number | null;
  features: string[];
  createdAt?: string;
  updatedAt?: string;
}

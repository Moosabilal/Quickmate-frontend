import { AxiosError } from "axios";

export type ApiError =
  | AxiosError<{ message?: string }>  
  | { message?: string }            
  | string;

export interface IApiError extends Error {
  status?: number;
}
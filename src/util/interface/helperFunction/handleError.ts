import axios from "axios";

export function handleAxiosError(error: unknown, defaultMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data?.message as string) ||
      (error.message as string) ||
      defaultMessage;
    throw new Error(message);
  } else if (error instanceof Error) {
    throw new Error(error.message || defaultMessage);
  } else {
    throw new Error(defaultMessage);
  }
}

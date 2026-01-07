import axios from "axios";

interface ZodError {
  message: string;
  path?: (string | number)[];
  code?: string;
}

type ErrorWithStatus = Error & { status?: number };

export function handleAxiosError(error: unknown, defaultMessage: string): never {
  console.log('the error in the error handler', error)

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const backendMessage = responseData?.message;
    const status = error.response?.status;

    let zodErrorMessage: string | null = null;

    if (typeof backendMessage === 'string') {
      if (backendMessage.trim().startsWith('[') && backendMessage.trim().endsWith(']')) {
        const parsed = JSON.parse(backendMessage);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstError = parsed[0] as ZodError;
          if (firstError && firstError.message) {
            zodErrorMessage = firstError.message;
          }
        }
      }
    }

    let finalMessage = defaultMessage;

    if (zodErrorMessage) {
      finalMessage = zodErrorMessage;
    } else if (Array.isArray(responseData) && responseData.length > 0) {
      const firstError = responseData[0] as ZodError;
      if (firstError && firstError.message) {
        finalMessage = firstError.message;
      }
    } else {
      finalMessage = (typeof backendMessage === 'string' ? backendMessage : "") ||
        (error.message as string) ||
        defaultMessage;
    }

    const err = new Error(finalMessage) as ErrorWithStatus;

    err.status = status;

    throw err;
  } else if (error instanceof Error) {
    throw new Error(error.message || defaultMessage);
  } else {
    throw new Error(defaultMessage);
  }
}
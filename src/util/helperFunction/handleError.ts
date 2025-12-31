import axios from "axios";

interface ZodError {
  message: string;
  path?: (string | number)[];
  code?: string;
}

export function handleAxiosError(error: unknown, defaultMessage: string): never {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const backendMessage = responseData?.message;
    
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

    if (zodErrorMessage) {
        throw new Error(zodErrorMessage);
    }

    if (Array.isArray(responseData) && responseData.length > 0) {
      const firstError = responseData[0] as ZodError;
      if (firstError && firstError.message) {
        throw new Error(firstError.message);
      }
    }

    const finalMessage =
      (typeof backendMessage === 'string' ? backendMessage : "") ||
      (error.message as string) ||
      defaultMessage;

    throw new Error(finalMessage);

  } else if (error instanceof Error) {
    throw new Error(error.message || defaultMessage);
  } else {
    throw new Error(defaultMessage);
  }
}
import axios from "axios";

export function handleAxiosError(error: unknown, defaultMessage: string): never {
  console.log('theererererere', error)
  if (axios.isAxiosError(error)) {
    console.log('the errorororo', error.response)
    const message =
      (error.response?.data?.message as string) ||
      (error.message as string) ||
      defaultMessage;
      console.log('the error message', message)
    throw new Error(message);
  } else if (error instanceof Error) {
    console.log('the errorasdfasdfsafsororo', error)
    throw new Error(error.message || defaultMessage);
  } else {
    console.log('the erroasdfsdfsdfsdfdfdfdfdrororod', error)
    throw new Error(defaultMessage);
  }
}

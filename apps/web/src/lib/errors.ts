import axios from "axios";
import { getApiBaseUrl } from "./api";

export function getRequestErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;

  if (!error.response) {
    return `Cannot reach API at ${getApiBaseUrl()}. Check that the backend is running.`;
  }

  const message = error.response.data?.message;
  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string" && message.trim()) return message;

  return `${fallback} Server returned ${error.response.status}.`;
}

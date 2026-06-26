import axios from "axios";
import { getToken } from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiBaseUrl() {
  return api.defaults.baseURL ?? "http://localhost:3001/api";
}

export function unwrapData<T>(response: { data: { data: T } }) {
  return response.data.data;
}

import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://food-journal-api-production.up.railway.app/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "en",
  },
});

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const locale = useAuthStore.getState().user?.locale ?? "en";
  config.headers["Accept-Language"] = locale;
  return config;
});

// Surface API errors cleanly
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.detail ??
      error.response?.data?.error?.message ??
      error.message ??
      "Unknown error";
    return Promise.reject(new Error(message));
  },
);

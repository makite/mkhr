import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";

let navigateFunction: ((path: string) => void) | null = null;

export const setNavigate = (navigate: (path: string) => void) => {
  navigateFunction = navigate;
};

type ApiClient = Omit<
  AxiosInstance,
  "request" | "get" | "delete" | "head" | "options" | "post" | "put" | "patch"
> & {
  request<T = unknown>(config: AxiosRequestConfig): Promise<T>;
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  head<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  options<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
};

const api: ApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
}) as unknown as ApiClient;

const raw = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (!error.response) {
      return Promise.reject({ message: "Network error", status: 0 });
    }

    const { status } = error.response;
    const msg = error.response.data?.message || "Something went wrong";
    const details =
      error.response.data?.errors ||
      error.response.data?.error ||
      error.response.data?.data ||
      null;

    // Try one refresh attempt for expired access tokens (cookie-based refresh token).
    const originalRequest = error.config || {};
    if (
      status === 401 &&
      !originalRequest._retry &&
      !String(originalRequest.url || "").includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await raw.post("/auth/refresh-token", {});
        const newToken =
          refreshRes?.data?.data?.accessToken ||
          refreshRes?.data?.data?.token ||
          refreshRes?.data?.accessToken ||
          null;

        if (newToken) {
          localStorage.setItem("token", String(newToken));
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return (await (api as any).request(originalRequest)) as any;
        }
      } catch {
        // fall through to logout flow
      }
    }

    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("session out! please login again");
      if (navigateFunction) {
        navigateFunction("/");
      } else {
        window.location.href = "/";
      }
    }

    return Promise.reject({ message: msg, status, details });
  },
);

export default api;

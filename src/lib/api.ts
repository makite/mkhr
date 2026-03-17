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
  (error) => {
    if (!error.response) {
      return Promise.reject({ message: "Network error", status: 0 });
    }

    const { status } = error.response;
    const msg = error.response.data?.message || "Something went wrong";

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

    return Promise.reject({ message: msg, status });
  },
);

export default api;

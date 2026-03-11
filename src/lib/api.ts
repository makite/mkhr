import axios from "axios";
import { toast } from "sonner";

let navigateFunction: ((path: string) => void) | null = null;

export const setNavigate = (navigate: (path: string) => void) => {
  navigateFunction = navigate;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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

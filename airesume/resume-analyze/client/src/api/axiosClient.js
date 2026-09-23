import axios from "axios";
import { API_URL } from "../config";

export const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;

const redirectToLogin = () => {
  sessionStorage.removeItem("email");
  localStorage.removeItem("email");
  sessionStorage.removeItem("role");
  localStorage.removeItem("role");
  if (!window.location.pathname.startsWith("/Login")) {
    window.location.href = "/Login";
  }
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        try {
          await new Promise((resolve) => {
            const check = setInterval(() => {
              if (!isRefreshing) {
                clearInterval(check);
                resolve(true);
              }
            }, 100);
          });
          return axiosClient(originalRequest);
        } catch (err) {
          redirectToLogin();
          return Promise.reject(err);
        }
      }

      isRefreshing = true;
      try {
        await axiosClient.post("/auth/refresh", {});
        isRefreshing = false;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
import axios from "axios";
import { getAccessToken, setAccessToken } from "../context/authTokenStore.js";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Used to make concurrent 401 requests share one refresh operation.
let refreshPromise = null;

export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .get(`${API_URL}/auth/rotate-token`, {
        withCredentials: true,
      })
      .then((response) => {
        const newToken = response.data.accessToken;

        if (!newToken) {
          throw new Error("Refresh response did not contain an access token");
        }

        setAccessToken(newToken);
        return response.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Routes that should not trigger automatic token refresh.
const excludedRefreshRoutes = [
  "/auth/login",
  "/auth/login-captain",
  "/auth/register",
  "/auth/register-captain",
  "/auth/verify-email",
  "/auth/rotate-token",
];

const shouldSkipRefresh = (url = "") =>
  excludedRefreshRoutes.some((route) => url.includes(route));

// Attach the current in-memory access token to each API request.
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh the access token after an expired-token response.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // All simultaneous failed requests share the same refresh call.
      // if (!refreshPromise) {
      //   refreshPromise = axios
      //     .get(`${API_URL}/auth/rotate-token`, {
      //       withCredentials: true,
      //     })
      //     .then((response) => {
      //       const newToken = response.data.accessToken;

      //       if (!newToken) {
      //         throw new Error(
      //           "Refresh response did not contain an access token",
      //         );
      //       }

      //       setAccessToken(newToken);

      //       return newToken;
      //     })
      //     .finally(() => {
      //       refreshPromise = null;
      //     });
      // }

      const refreshData = await refreshAccessToken();
      const newAccessToken = refreshData.accessToken;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);

      const isCaptain = window.location.pathname.startsWith("/captain");

      // Clear the existing profile data.
      localStorage.removeItem(isCaptain ? "captain" : "user");

      if (isCaptain) {
        localStorage.removeItem("captainId");
      }

      window.location.href = isCaptain ? "/captain-login" : "/login";

      return Promise.reject(refreshError);
    }
  },
);

export default api;

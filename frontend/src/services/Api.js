import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// Decide which token belongs to the current app section.
const getTokenKey = () => {
  const path = window.location.pathname;

  if (path.startsWith("/captain")) {
    return "captainAccessToken";
  }

  return "userAccessToken";
};

// Attach the correct role-specific access token.
api.interceptors.request.use(
  (config) => {
    const tokenKey = getTokenKey();
    const token = localStorage.getItem(tokenKey);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh the token and retry the failed request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const tokenKey = getTokenKey();

      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/rotate-token",
          { withCredentials: true },
        );

        const newAccessToken = response.data.accessToken;

        localStorage.setItem(tokenKey, newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(tokenKey);

        const isCaptain = tokenKey === "captainAccessToken";

        localStorage.removeItem(isCaptain ? "captain" : "user");

        window.location.href = isCaptain ? "/captain-login" : "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

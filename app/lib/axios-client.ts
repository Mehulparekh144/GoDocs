import axios from "axios";
import axiosRetry from "axios-retry";

console.log(process.env.NEXT_PUBLIC_SERVER_URL);

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (err) => {
    if (axios.isAxiosError(err)) {
      if (
        err.response?.status === 401 &&
        err.config?.url !== "/auth/refresh-token" &&
        err.config?.url !== "/auth/logout"
      ) {
        try {
          // Refresh token endpoint will automatically set new accessToken cookie
          await axiosClient.post("/auth/refresh-token");

          // Retry the original request with the new cookie
          if (err.config) {
            return axiosClient(err.config);
          }
        } catch (error) {
          console.error("Refresh Token Error: ", error);
          window.location.href = "/get-started";
        }
      }
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Something went wrong";
      return Promise.reject(new Error(message));
    }
  },
);

axiosRetry(axiosClient, {
  retries: 3,
  retryDelay: (...args) => axiosRetry.exponentialDelay(...args),
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) ||
    (typeof error.response?.status === "number" &&
      error.response.status >= 500 &&
      error.response.status <= 599),
});

"use server";

import { type User } from "@/hooks/use-auth";

import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type Document } from "./types";

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

export const createServerAxios = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(
      (cookie: { name: string; value: string }) =>
        `${cookie.name}=${cookie.value}`,
    )
    .join("; ");

  const serverAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    withCredentials: true,
  });

  // Request interceptor for logging and debugging
  serverAxios.interceptors.request.use(
    (config) => {
      console.log(
        `[Server Axios] ${config.method?.toUpperCase()} ${config.url}`,
      );
      return config;
    },
    (error: Error) => {
      console.error("[Server Axios] Request error:", error);
      return Promise.reject(new Error(error.message));
    },
  );

  // Response interceptor for error handling and retry logic
  serverAxios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfigWithRetry;

      // Handle 401/403 errors with token refresh
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        originalRequest.url !== "/auth/refresh-token" &&
        originalRequest.url !== "/auth/logout"
      ) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token
          await serverAxios.post("/auth/refresh-token");

          // Update cookies for subsequent requests
          const newCookieHeader = cookieStore
            .getAll()
            .map(
              (cookie: { name: string; value: string }) =>
                `${cookie.name}=${cookie.value}`,
            )
            .join("; ");

          serverAxios.defaults.headers.Cookie = newCookieHeader;
          if (originalRequest.headers) {
            originalRequest.headers.Cookie = newCookieHeader;
          }

          // Retry the original request
          return serverAxios(originalRequest);
        } catch (refreshError) {
          console.error("[Server Axios] Token refresh failed:", refreshError);
          // If refresh fails, the request will fail with 401
          return Promise.reject(new Error("Authentication failed"));
        }
      }

      // Handle other errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          (error.response.data as { message?: string })?.message ??
          error.message ??
          "Server error";

        console.error(`[Server Axios] ${status} Error:`, message);

        // Create a more descriptive error
        const enhancedError = new Error(message) as Error & {
          status?: number;
          response?: unknown;
        };
        enhancedError.status = status;
        enhancedError.response = error.response;

        return Promise.reject(enhancedError);
      } else if (error.request) {
        // Network error
        console.error("[Server Axios] Network error:", error.message);
        return Promise.reject(
          new Error("Network error - please check your connection"),
        );
      } else {
        // Other error
        console.error("[Server Axios] Unknown error:", error.message);
        return Promise.reject(new Error(error.message || "Unknown error"));
      }
    },
  );

  return serverAxios;
};

export const getUser = async () => {
  try {
    const serverAxios = await createServerAxios();
    const response = await serverAxios.get("/user/me");
    return response.data as User;
  } catch (error) {
    if (error instanceof AxiosError && error?.response?.status === 401) {
      redirect("/get-started");
    }

    return null;
  }
};

export const getDocuments = async (): Promise<Document[]> => {
  try {
    const serverAxios = await createServerAxios();
    const response = await serverAxios.get("/document");
    return response.data as Document[];
  } catch (error) {
    if (error instanceof AxiosError && error?.response?.status === 401) {
      redirect("/get-started");
    }

    return [];
  }
};

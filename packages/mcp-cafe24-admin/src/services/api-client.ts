import axios, { type AxiosError } from "axios";
import { getAccessToken } from "./auth";
import { CAFE24_API_BASE_URL } from "./constants";

// Get API base URL from environment
export function getApiBaseUrl(): string {
  const mallId = process.env.CAFE24_MALL_ID;
  if (!mallId) {
    throw new Error("CAFE24_MALL_ID environment variable is required");
  }
  return CAFE24_API_BASE_URL.replace("{mall_id}", mallId);
}

// Make API request
export async function makeApiRequest<T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  params?: any,
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const mallId = process.env.CAFE24_MALL_ID;
  const clientId = process.env.CAFE24_CLIENT_ID;
  const clientSecret = process.env.CAFE24_CLIENT_SECRET;
  const token = await getAccessToken(mallId!, clientId, clientSecret);

  try {
    const response = await axios({
      method,
      url: `${baseUrl}${endpoint}`,
      data,
      params,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Cafe24 API returns data in different formats
    // Check if response has error structure
    if (response.data.error) {
      throw new Error(
        `Cafe24 API Error: ${response.data.error.message} (${response.data.error.code})`,
      );
    }

    // Return data directly
    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const errorData = axiosError.response.data as any;

        switch (status) {
          case 400:
            throw new Error(
              `Bad Request: ${errorData?.error?.message || "Invalid request parameters"}`,
            );
          case 401:
            throw new Error(
              "Unauthorized: Invalid or expired access token. Please check your credentials or refresh your token.",
            );
          case 403:
            throw new Error("Forbidden: Access denied or insufficient permissions");
          case 404:
            throw new Error("Not Found: Resource not found");
          case 409:
            throw new Error("Conflict: Resource already exists");
          case 422:
            throw new Error(
              `Unprocessable Entity: ${errorData?.error?.message || "Validation failed"}`,
            );
          case 429:
            throw new Error(
              "Too Many Requests: Rate limit exceeded. Please wait before making more requests.",
            );
          case 500:
            throw new Error(
              "Internal Server Error: Temporary error occurred. Please try again later.",
            );
          case 503:
            throw new Error("Service Unavailable: Server is temporarily unavailable");
          case 504:
            throw new Error("Gateway Timeout: Request timed out. Please try again.");
          default:
            throw new Error(`API Request failed with status ${status}`);
        }
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Request timed out. Please try again.");
      }
    }
    throw error;
  }
}

// Handle API errors and return actionable messages
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return `Unexpected error: ${String(error)}`;
}

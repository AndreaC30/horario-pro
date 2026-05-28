import { clearToken, getToken } from "../utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  if (rest.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  if (response.status === 401) {
    clearToken();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.assign("/login");
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    let message = response.statusText;
    if (payload && typeof payload === "object" && "detail" in payload) {
      const detail = (payload as { detail: unknown }).detail;
      message = typeof detail === "string" ? detail : JSON.stringify(detail);
    }
    throw new ApiError(message || "Error de API", response.status, payload);
  }

  return payload as T;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

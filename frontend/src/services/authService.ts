import { apiRequest } from "./apiClient";

export type UserProfile = {
  id: number;
  email: string;
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: UserProfile;
};

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return apiRequest<LoginResponse>("/api/v1/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return apiRequest<UserProfile>("/api/v1/auth/me");
}

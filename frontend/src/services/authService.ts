import { apiRequest } from "./apiClient";

export type UserProfile = {
  id: number;
  email: string;
  display_name: string | null;
  tour_completed: boolean;
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

export function forgotPassword(email: string) {
  return apiRequest<{ detail: string }>("/api/v1/auth/forgot-password", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email }),
  });
}

export function getMe() {
  return apiRequest<UserProfile>("/api/v1/auth/me");
}

export function updateMe(data: { display_name?: string | null }) {
  return apiRequest<UserProfile>("/api/v1/auth/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function changePassword(current_password: string, new_password: string) {
  return apiRequest<void>("/api/v1/auth/me/password", {
    method: "POST",
    body: JSON.stringify({ current_password, new_password }),
  });
}

export function completeTour() {
  return apiRequest<UserProfile>("/api/v1/auth/me/tour", {
    method: "PATCH",
    body: JSON.stringify({ tour_completed: true }),
  });
}

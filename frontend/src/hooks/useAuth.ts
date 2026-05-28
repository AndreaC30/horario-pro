import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "../services/apiClient";
import { clearToken, getToken, setToken } from "../utils/storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading");

  const bootstrap = useCallback(async () => {
    if (import.meta.env.DEV) {
      setStatus("authenticated");
      return;
    }

    const token = getToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    try {
      await apiRequest<{ email: string }>("/api/v1/auth/me");
      setStatus("authenticated");
    } catch {
      clearToken();
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (_email: string, _password: string) => {
    setStatus("unauthenticated");
    throw new Error("Login disponible en la fase 1 (auth API)");
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setStatus("unauthenticated");
  }, []);

  const persistToken = useCallback((token: string) => {
    setToken(token);
    setStatus("authenticated");
  }, []);

  return {
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    logout,
    persistToken,
    refresh: bootstrap,
  };
}

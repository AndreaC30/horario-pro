import { useCallback, useEffect, useState } from "react";

import * as authService from "../services/authService";
import { clearToken, getToken, setToken } from "../utils/storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading");

  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

  const bootstrap = useCallback(async () => {
    if (bypassAuth) {
      setStatus("authenticated");
      return;
    }

    const token = getToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    try {
      await authService.getMe();
      setStatus("authenticated");
    } catch {
      clearToken();
      setStatus("unauthenticated");
    }
  }, [bypassAuth]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setToken(data.access_token);
    setStatus("authenticated");
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

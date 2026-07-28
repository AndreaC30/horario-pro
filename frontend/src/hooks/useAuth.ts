import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import * as authService from "../services/authService";
import type { UserProfile } from "../services/authService";
import { clearToken, getToken, setToken } from "../utils/storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  persistToken: (token: string) => void;
  refresh: () => Promise<void>;
  markTourCompleted: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);

  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

  const bootstrap = useCallback(async () => {
    if (bypassAuth) {
      setUser({
        id: 0,
        email: "dev@local",
        tour_completed: false,
        created_at: new Date().toISOString(),
      });
      setStatus("authenticated");
      return;
    }

    const token = getToken();
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const me = await authService.getMe();
      setUser(me);
      setStatus("authenticated");
    } catch {
      clearToken();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [bypassAuth]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const data = await authService.register(email, password);
    setToken(data.access_token);
    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const persistToken = useCallback((token: string) => {
    setToken(token);
    setStatus("authenticated");
  }, []);

  const markTourCompleted = useCallback(async () => {
    if (bypassAuth) {
      setUser((prev) => (prev ? { ...prev, tour_completed: true } : prev));
      return;
    }
    try {
      const updated = await authService.completeTour();
      setUser(updated);
    } catch {
      setUser((prev) => (prev ? { ...prev, tour_completed: true } : prev));
    }
  }, [bypassAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      login,
      register,
      logout,
      persistToken,
      refresh: bootstrap,
      markTourCompleted,
      setUser,
    }),
    [
      status,
      user,
      login,
      register,
      logout,
      persistToken,
      bootstrap,
      markTourCompleted,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

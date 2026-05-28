import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { AppShell } from "./AppShell";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm text-slate-600">Cargando sesión…</p>
      </div>
    );
  }

  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

  if (!bypassAuth && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AppShell title="HorarioPro">
      <Outlet />
    </AppShell>
  );
}

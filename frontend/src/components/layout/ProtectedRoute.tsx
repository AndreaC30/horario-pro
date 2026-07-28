import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { AppShell } from "./AppShell";

const titles: Record<string, string> = {
  "/dashboard": "Inicio",
  "/historial": "Historial",
  "/clientes": "Clientes",
  "/clientes/nuevo": "Nuevo cliente",
  "/jornada/nueva": "Nueva jornada",
};

function resolveTitle(pathname: string): string {
  if (pathname.startsWith("/jornada/") && pathname !== "/jornada/nueva") {
    return "Editar jornada";
  }
  if (/^\/clientes\/\d+\/editar$/.test(pathname)) {
    return "Editar cliente";
  }
  return titles[pathname] ?? "WorkShift";
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-text-secondary">Cargando sesión…</p>
      </div>
    );
  }

  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

  if (!bypassAuth && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AppShell title={resolveTitle(location.pathname)}>
      <Outlet />
    </AppShell>
  );
}

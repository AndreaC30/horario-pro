import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoChevronBack, IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "../ui/Button";
import { BottomNav } from "./BottomNav";
import { OfflineBanner } from "./OfflineBanner";

type AppShellProps = {
  title: string;
  children: ReactNode;
};

/** Rutas de formulario / detalle donde conviene flecha atrás. */
function shouldShowBack(pathname: string): boolean {
  if (pathname.startsWith("/jornada/")) return true;
  if (pathname === "/clientes/nuevo") return true;
  if (/^\/clientes\/\d+\/editar$/.test(pathname)) return true;
  return false;
}

export function AppShell({ title, children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const showBack = shouldShowBack(location.pathname);

  const handleBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col bg-background pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:max-w-3xl">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md supports-[padding:max(0px)]:pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            {showBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                aria-label="Volver"
              >
                <IoChevronBack className="h-6 w-6" aria-hidden />
              </button>
            ) : null}
            <h1 className="truncate font-display text-lg font-semibold tracking-tight text-text-primary">
              {title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
              onClick={() => toggleTheme()}
              aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              {theme === "dark" ? <IoSunnyOutline className="h-5 w-5" /> : <IoMoonOutline className="h-5 w-5" />}
            </button>
            <Button variant="ghost" type="button" onClick={handleLogout} className="min-h-touch px-2 text-sm">
              Salir
            </Button>
          </div>
        </div>
      </header>
      <OfflineBanner />
      <main className="flex-1 space-y-4 px-4 py-4 sm:px-5">{children}</main>
      <BottomNav />
    </div>
  );
}

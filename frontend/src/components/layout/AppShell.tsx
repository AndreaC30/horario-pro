import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoChevronBack, IoPersonCircleOutline } from "react-icons/io5";

import { useAuth } from "../../hooks/useAuth";
import { WORKSHIFT_TOUR_STEPS } from "../../lib/tour-steps";
import { GuidedTour } from "../tour/GuidedTour";
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
  if (pathname === "/cuenta") return true;
  return false;
}

function greetingName(user: { display_name: string | null; email: string } | null): string | null {
  if (!user) return null;
  const name = user.display_name?.trim();
  if (name) return name;
  const local = user.email.split("@")[0];
  return local || null;
}

export function AppShell({ title, children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, markTourCompleted } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const autoStartedRef = useRef(false);

  const showBack = shouldShowBack(location.pathname);
  const hello = greetingName(user);

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

  const ensureTourPath = useCallback(
    (path: string) => {
      if (location.pathname !== path) {
        navigate(path, { replace: true });
      }
    },
    [location.pathname, navigate],
  );

  const finishTour = useCallback(() => {
    setShowTour(false);
    void markTourCompleted();
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, markTourCompleted, navigate]);

  // Auto-start once for users who have not completed the tour.
  useEffect(() => {
    if (!user || user.tour_completed) return;
    if (autoStartedRef.current) return;
    const timer = window.setTimeout(() => {
      autoStartedRef.current = true;
      if (location.pathname !== "/dashboard") {
        navigate("/dashboard", { replace: true });
      }
      setShowTour(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [user, location.pathname, navigate]);

  // Open tour from Cuenta → Ver guía
  useEffect(() => {
    const state = location.state as { openTour?: boolean } | null;
    if (state?.openTour) {
      setShowTour(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

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
            <div className="min-w-0">
              {hello && !showBack ? (
                <p className="truncate font-mono text-[0.65rem] text-text-muted">Hola, {hello}</p>
              ) : null}
              <h1 className="truncate font-display text-lg font-semibold tracking-tight text-text-primary">
                {title}
              </h1>
            </div>
          </div>
          <Link
            to="/cuenta"
            state={{ from: location.pathname }}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Cuenta"
            title="Cuenta"
          >
            <IoPersonCircleOutline className="h-6 w-6" />
          </Link>
        </div>
      </header>
      <OfflineBanner />
      <main className="flex-1 space-y-4 px-4 py-4 sm:px-5">{children}</main>
      <BottomNav />

      {showTour ? (
        <GuidedTour
          steps={WORKSHIFT_TOUR_STEPS}
          onEnsurePath={ensureTourPath}
          onComplete={finishTour}
          onSkip={finishTour}
        />
      ) : null}
    </div>
  );
}

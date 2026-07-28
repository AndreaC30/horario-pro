import { Link, Navigate } from "react-router-dom";
import {
  PiClockCountdown,
  PiCurrencyEur,
  PiDevices,
  PiUserCircle,
  PiChartLineUp,
  PiLightning,
} from "react-icons/pi";

import { BrandLogo } from "../components/ui/BrandLogo";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { TYPE_BODY, TYPE_DISPLAY, TYPE_EYEBROW } from "../lib/typography";

const FEATURES = [
  {
    Icon: PiClockCountdown,
    title: "Jornadas en segundos",
    text: "Registra inicio, fin y pausas sin fricción. Ideal para días con varios clientes.",
  },
  {
    Icon: PiUserCircle,
    title: "Clientes y tarifas",
    text: "Guarda cada cliente con su tarifa horaria y color para identificarlos al instante.",
  },
  {
    Icon: PiChartLineUp,
    title: "Hoy, semana y mes",
    text: "Ve horas e ingresos estimados al momento: hoy en grande, el mes siempre a mano.",
  },
  {
    Icon: PiCurrencyEur,
    title: "Extras de desplazamiento",
    text: "Suma extras de conducción y tenlos claros en el resumen, no perdidos en notas.",
  },
  {
    Icon: PiLightning,
    title: "Historial claro",
    text: "Consulta, edita o elimina jornadas pasadas con un historial ordenado por mes.",
  },
  {
    Icon: PiDevices,
    title: "En el móvil, siempre",
    text: "Instálala como app (PWA). Funciona en el bolsillo, con el look denso de WorkShift.",
  },
] as const;

function PhoneMock() {
  return (
    <div className="landing-phone relative mx-auto w-[min(17.5rem,78vw)]" aria-hidden>
      <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-2 shadow-[var(--card-shadow-elevated)]">
        <div className="overflow-hidden rounded-[1.55rem] border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <span className="font-display text-sm font-semibold text-primary">Inicio</span>
            <span className="text-[10px] text-text-muted">WorkShift</span>
          </div>
          <div className="space-y-3 p-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-text-muted">Hoy</p>
              <p className="mt-0.5 font-display text-xs font-semibold text-text-primary">Martes, 28</p>
            </div>
            <div className="rounded-lg border border-[var(--accent-border)] bg-surface p-3 shadow-[inset_3px_0_0_var(--accent)]">
              <p className="font-display text-2xl font-semibold tabular-nums text-primary">6,5 h</p>
              <p className="mt-1 text-[11px] text-text-secondary">
                Estimado <span className="font-semibold text-text-primary">78,00 €</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
                <p className="font-mono text-[8px] uppercase text-text-muted">Horas</p>
                <p className="font-display text-sm font-semibold tabular-nums text-text-primary">142 h</p>
              </div>
              <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
                <p className="font-mono text-[8px] uppercase text-text-muted">Ingresos</p>
                <p className="font-display text-sm font-semibold tabular-nums text-text-primary">1.680 €</p>
              </div>
            </div>
            <div className="rounded-lg bg-primary px-3 py-2.5 text-center text-xs font-semibold text-[var(--accent-ink)]">
              + Nueva jornada
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-root relative min-h-dvh overflow-x-hidden bg-background text-text-primary">
      <div className="pointer-events-none absolute inset-0 landing-atmosphere" aria-hidden />

      <header className="relative z-20 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="WorkShift">
            <img src="/brand-logo.png" alt="" className="h-9 w-9" width={36} height={36} />
            <span className="font-display text-lg font-semibold tracking-tight">
              Work<span className="text-primary">Shift</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button type="button" variant="ghost" className="min-h-10 px-3 text-sm">
                Entrar
              </Button>
            </Link>
            <Link to="/login?mode=register">
              <Button type="button" className="min-h-10 px-3 text-sm sm:px-4">
                Crear cuenta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — una composición */}
        <section className="relative z-10">
          <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-20">
            <div className="landing-fade-up space-y-6 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <BrandLogo size="lg" showText={false} />
              </div>
              <div className="space-y-3">
                <p className={TYPE_EYEBROW}>Control de horas laborales</p>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
                  Work<span className="text-primary">Shift</span>
                </h1>
                <p className={`${TYPE_BODY} mx-auto max-w-md text-base sm:text-lg lg:mx-0`}>
                  Registra jornadas, clientes e ingresos estimados desde el móvil. Claro, rápido y
                  pensado para quien trabaja por horas.
                </p>
              </div>
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
                <Link to="/login?mode=register" className="sm:min-w-[10.5rem]">
                  <Button type="button" className="w-full">
                    Empezar gratis
                  </Button>
                </Link>
                <Link to="/login" className="sm:min-w-[10.5rem]">
                  <Button type="button" variant="secondary" className="w-full">
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            </div>

            <div className="landing-fade-up landing-fade-up-delay flex justify-center lg:justify-end">
              <PhoneMock />
            </div>
          </div>
        </section>

        {/* Herramientas */}
        <section className="relative z-10 border-t border-border/70 bg-[var(--bg-soft)]/60">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className={TYPE_EYEBROW}>En la palma de la mano</p>
              <h2 className={`${TYPE_DISPLAY} mt-2`}>Todo lo que necesitas para controlar tu tiempo</h2>
              <p className={`${TYPE_BODY} mt-3`}>
                WorkShift concentra el día a día laboral en una sola app: fichar, cobrar y revisar sin
                hojas de cálculo.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ Icon, title, text }) => (
                <li
                  key={title}
                  className="rounded-[10px] border border-border bg-surface p-4 shadow-[var(--card-shadow)] transition hover:border-[var(--border-hover)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 font-display text-base font-semibold text-text-primary">{title}</h3>
                  <p className={`${TYPE_BODY} mt-1.5 text-sm`}>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA final */}
        <section className="relative z-10 border-t border-border/70">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="landing-cta-band rounded-2xl border border-[var(--accent-border)] px-6 py-10 text-center sm:px-10">
              <p className={TYPE_EYEBROW}>Listo cuando tú lo estés</p>
              <h2 className={`${TYPE_DISPLAY} mt-2`}>Empieza a registrar tu próxima jornada</h2>
              <p className={`${TYPE_BODY} mx-auto mt-3 max-w-lg`}>
                Crea tu cuenta en un minuto. Sin recuperación por correo por ahora: guarda bien tu
                contraseña y entra cuando quieras.
              </p>
              <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link to="/login?mode=register">
                  <Button type="button" className="w-full sm:min-w-[12rem]">
                    Crear cuenta
                  </Button>
                </Link>
                <Link to="/login">
                  <Button type="button" variant="ghost" className="w-full sm:min-w-[12rem]">
                    Entrar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/70 py-6 text-center">
        <p className="text-xs text-text-muted">
          WorkShift · control de horas e ingresos estimados
        </p>
      </footer>
    </div>
  );
}

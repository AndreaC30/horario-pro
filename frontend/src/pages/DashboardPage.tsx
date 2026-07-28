import { useState } from "react";
import { Link } from "react-router-dom";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

import { ClientEarningsBreakdown } from "../components/domain/ClientEarningsBreakdown";
import { DrivingExtrasSummary } from "../components/domain/DrivingExtrasSummary";
import { ShiftList } from "../components/domain/ShiftList";
import { StatCard } from "../components/domain/StatCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Fab } from "../components/ui/Fab";
import { SkeletonBlock } from "../components/ui/SkeletonBlock";
import { useDashboard } from "../hooks/useDashboard";
import { TYPE_BODY, TYPE_DISPLAY, TYPE_EYEBROW, TYPE_HERO_NUMBER } from "../lib/typography";
import { formatMoney } from "../utils/money";
import { formatHours } from "../utils/time";

function todayLabel(): string {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function monthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

function isCurrentOrFuture(year: number, month: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

export function DashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const isCurrentMonth = isCurrentOrFuture(year, month);

  const { data, loading, error, refresh } = useDashboard(5, year, month);

  const goPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const goNextMonth = () => {
    if (isCurrentMonth) return;
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-36" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? "Error desconocido"} onRetry={() => void refresh()} />;
  }

  const isEmpty = data.recent_shifts.length === 0 && Number(data.month.hours) === 0;
  const todayEmpty = Number(data.today.hours) === 0;

  return (
    <>
      <div className="space-y-10 pb-20">
        {/* ——— 1. HOY ——— */}
        <section aria-labelledby="section-hoy" className="space-y-3">
          <div>
            <p className={TYPE_EYEBROW}>Hoy</p>
            <h2 id="section-hoy" className={`${TYPE_DISPLAY} mt-0.5 capitalize`}>
              {todayLabel()}
            </h2>
          </div>

          <div className="card-accent" aria-live="polite">
            {todayEmpty ? (
              <div className="space-y-2">
                <p className="font-display text-lg font-semibold tracking-tight text-text-secondary sm:text-xl">
                  Sin horas hoy
                </p>
                <p className={TYPE_BODY}>
                  Cuando registres una jornada, aquí verás las horas y el estimado del día.
                </p>
                <Link to="/jornada/nueva" className="mt-2 inline-block sm:hidden">
                  <Button type="button" className="w-full">
                    + Nueva jornada
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className={TYPE_HERO_NUMBER}>{formatHours(data.today.hours)}</p>
                <p className={`${TYPE_BODY} mt-1`}>
                  Estimado{" "}
                  <span className="font-semibold tabular-nums text-text-primary">
                    {formatMoney(data.today.estimated_money)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ——— 2. ESTE MES ——— */}
        <section aria-labelledby="section-mes" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className={TYPE_EYEBROW}>Este mes</p>
              <h2 id="section-mes" className={`${TYPE_DISPLAY} mt-0.5 capitalize`}>
                {monthLabel(year, month)}
              </h2>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={goPrevMonth}
                className="min-h-touch min-w-touch rounded-lg p-2 text-text-secondary transition hover:bg-[var(--bg-soft)] hover:text-text-primary"
                aria-label="Mes anterior"
              >
                <PiCaretLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                disabled={isCurrentMonth}
                className={`min-h-touch min-w-touch rounded-lg p-2 transition ${
                  isCurrentMonth
                    ? "cursor-default text-text-muted"
                    : "text-text-secondary hover:bg-[var(--bg-soft)] hover:text-text-primary"
                }`}
                aria-label="Mes siguiente"
              >
                <PiCaretRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-stretch">
            <StatCard
              label="Horas"
              value={parseFloat(data.month.hours) || 0}
              suffix="h"
            />
            <StatCard
              label="Ingresos"
              value={parseFloat(data.month.estimated_money) || 0}
              suffix="€"
            />
            <div className="col-span-2 hidden sm:col-span-2 sm:block lg:col-span-1 lg:flex lg:items-stretch">
              <Link to="/jornada/nueva" className="block w-full lg:flex lg:flex-1">
                <Button className="h-full min-h-touch w-full">+ Nueva jornada</Button>
              </Link>
            </div>
          </div>

          <p className="font-mono text-xs text-text-muted sm:text-sm">
            Semana en curso ·{" "}
            <span className="tabular-nums text-text-secondary">{formatHours(data.week.hours)}</span>
            {" · "}
            <span className="tabular-nums text-text-secondary">
              {formatMoney(data.week.estimated_money)}
            </span>
          </p>
        </section>

        {/* ——— 3. POR CLIENTE (+ extras) ——— */}
        <section aria-labelledby="section-clientes" className="space-y-4">
          <div>
            <p className={TYPE_EYEBROW}>Desglose</p>
            <h2 id="section-clientes" className={`${TYPE_DISPLAY} mt-0.5`}>
              Por cliente
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            <ClientEarningsBreakdown
              week={data.by_client_week ?? []}
              month={data.by_client_month ?? []}
              hideMonthTotal
            />
            <DrivingExtrasSummary
              today={data.today.driving_extras}
              week={data.week.driving_extras}
              month={data.month.driving_extras}
            />
          </div>
        </section>

        {/* ——— 4. ACTIVIDAD ——— */}
        <section aria-labelledby="section-actividad" className="space-y-3">
          <div>
            <p className={TYPE_EYEBROW}>Actividad</p>
            <h2 id="section-actividad" className={`${TYPE_DISPLAY} mt-0.5`}>
              Últimas jornadas
            </h2>
          </div>

          <div className="border-t border-border/70 pt-3">
            {isEmpty ? (
              <EmptyState
                title="Aún no hay jornadas"
                description="Crea un cliente y registra tu primera jornada."
                action={
                  <Link to="/jornada/nueva">
                    <Button className="w-full">+ Nueva jornada</Button>
                  </Link>
                }
              />
            ) : (
              <>
                <ShiftList shifts={data.recent_shifts} embedded />
                <Link
                  to="/historial"
                  className="mt-3 block text-center font-mono text-xs font-semibold uppercase tracking-wide text-primary transition-colors hover:text-primary-hover"
                >
                  Ver historial completo
                </Link>
              </>
            )}
          </div>
        </section>
      </div>

      <Fab to="/jornada/nueva" label="+ Nueva jornada" />
    </>
  );
}

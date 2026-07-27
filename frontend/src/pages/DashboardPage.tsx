import { useState } from "react";
import { Link } from "react-router-dom";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

import { ClientEarningsBreakdown } from "../components/domain/ClientEarningsBreakdown";
import { DrivingExtrasSummary } from "../components/domain/DrivingExtrasSummary";
import { ShiftList } from "../components/domain/ShiftList";
import { StatCard } from "../components/domain/StatCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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
      <div className="space-y-4">
        <SkeletonBlock className="h-16" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
        <SkeletonBlock className="h-32" />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? "Error desconocido"} onRetry={() => void refresh()} />;
  }

  const isEmpty = data.recent_shifts.length === 0 && Number(data.month.hours) === 0;

  return (
    <>
      <div className="space-y-4 pb-20">
        {/* Hero denso estilo GDH — acento azul WorkShift */}
        <section
          className="card-accent animate-fade-up overflow-hidden"
          aria-live="polite"
        >
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_1fr] sm:items-stretch sm:gap-4">
            <div className="flex flex-col justify-center rounded-lg border border-border bg-[var(--bg-soft)] p-4">
              <p className={TYPE_EYEBROW}>Hoy</p>
              <h2 className={`${TYPE_DISPLAY} mt-1 capitalize`}>{todayLabel()}</h2>
              <p className={`${TYPE_HERO_NUMBER} mt-2`}>
                {formatHours(data.today.hours)}
              </p>
              <p className={`${TYPE_BODY} mt-1`}>
                Estimado{" "}
                <span className="font-semibold tabular-nums text-text-primary">
                  {formatMoney(data.today.estimated_money)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatCard
                magnetic
                label="Semana"
                value={parseFloat(data.week.hours) || 0}
                suffix="h"
                subvalue={parseFloat(data.week.estimated_money) || 0}
                subSuffix="€"
              />
              <StatCard
                magnetic
                label="Mes"
                value={parseFloat(data.month.hours) || 0}
                suffix="h"
                subvalue={parseFloat(data.month.estimated_money) || 0}
                subSuffix="€"
              />
              <StatCard
                magnetic
                label="€ hoy"
                value={parseFloat(data.today.estimated_money) || 0}
                suffix="€"
                subvalue={parseFloat(data.today.hours) || 0}
                subSuffix="h"
              />
              <StatCard
                magnetic
                label="€ mes"
                value={parseFloat(data.month.estimated_money) || 0}
                suffix="€"
                subvalue={parseFloat(data.month.hours) || 0}
                subSuffix="h"
              />
            </div>
          </div>
        </section>

        {/* Month navigator */}
        <div className="animate-fade-up stagger-1 flex items-center justify-between rounded-[10px] border border-border bg-surface px-2 py-1.5">
          <button
            type="button"
            onClick={goPrevMonth}
            className="min-h-touch min-w-touch rounded-lg p-2 text-text-secondary transition hover:bg-[var(--bg-soft)] hover:text-text-primary"
            aria-label="Mes anterior"
          >
            <PiCaretLeft className="h-5 w-5" />
          </button>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-text-primary capitalize sm:text-sm">
            {monthLabel(year, month)}
          </span>
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

        {/* Desktop CTA */}
        <div className="animate-fade-up stagger-2 hidden sm:block">
          <Link to="/jornada/nueva" className="block">
            <Button className="w-full">+ Nueva jornada</Button>
          </Link>
        </div>

        {/* Resumen mes compacto */}
        {Number(data.month.hours) > 0 ? (
          <div className="animate-fade-up stagger-3">
            <div className="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-muted)] px-4 py-3">
              <p className={TYPE_EYEBROW}>Resumen del mes</p>
              <p className="mt-1 text-sm text-text-secondary">
                <span className="font-display text-base font-semibold tabular-nums text-primary">
                  {formatHours(data.month.hours)}
                </span>
                {" · "}
                <span className="font-display text-base font-semibold tabular-nums text-text-primary">
                  {formatMoney(data.month.estimated_money)}
                </span>
              </p>
            </div>
          </div>
        ) : null}

        {/* Client breakdown */}
        <div className="animate-fade-up stagger-4">
          <ClientEarningsBreakdown
            week={data.by_client_week ?? []}
            month={data.by_client_month ?? []}
          />
        </div>

        {/* Driving extras */}
        <div className="animate-fade-up stagger-5">
          <DrivingExtrasSummary
            today={data.today.driving_extras}
            week={data.week.driving_extras}
            month={data.month.driving_extras}
          />
        </div>

        {/* Recent shifts */}
        <div className="animate-fade-up stagger-6">
          <Card title="Últimas jornadas">
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
          </Card>
        </div>
      </div>

      <Fab to="/jornada/nueva" label="+ Nueva jornada" />
    </>
  );
}

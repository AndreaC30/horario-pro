import { useState } from "react";
import { Link } from "react-router-dom";

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
import { formatMoney } from "../utils/money";
import { formatHours } from "../utils/time";

import { PiHandWaving, PiCaretLeft, PiCaretRight } from "react-icons/pi";
import React from "react";

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

function StaggeredGroup({ children }: { children: React.ReactNode }) {
  const childrenArr = React.Children.toArray(children);
  return (
    <>
      {childrenArr.map((child, i) => (
        <div key={i} className={`animate-fade-up`} style={{ animationDelay: `${i * 50}ms` }}>
          {child}
        </div>
      ))}
    </>
  );
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
      <div className="space-y-5 pb-20">
        {/* Header */}
        <header className="animate-fade-up space-y-1">
          <p className="text-sm text-text-muted">Hola</p>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary capitalize">{todayLabel()}</h2>
          <p className="text-sm text-text-secondary">
            Hoy: <span className="font-semibold text-text-primary">{formatHours(data.today.hours)}</span>
            {" · "}
            <span className="font-semibold text-text-primary">{formatMoney(data.today.estimated_money)}</span>
          </p>
        </header>

        {/* Month navigator */}
        <div className="animate-fade-up stagger-1 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevMonth}
            className="rounded-full p-2 text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition"
            aria-label="Mes anterior"
          >
            <PiCaretLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-text-primary capitalize">
            {monthLabel(year, month)}
          </span>
          <button
            type="button"
            onClick={goNextMonth}
            disabled={isCurrentMonth}
            className={`rounded-full p-2 transition ${
              isCurrentMonth
                ? "text-text-muted cursor-default"
                : "text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
            }`}
            aria-label="Mes siguiente"
          >
            <PiCaretRight className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop CTA */}
        <div className="animate-fade-up stagger-2 hidden sm:block">
          <Link to="/jornada/nueva" className="block">
            <Button className="w-full">+ Nueva jornada</Button>
          </Link>
        </div>

        {/* Stats grid */}
        <StaggeredGroup>
          <div className="grid grid-cols-2 gap-3">
            <StatCard magnetic label="Hoy" value={parseFloat(data.today.hours) || 0} suffix="h" subvalue={parseFloat(data.today.estimated_money) || 0} subSuffix="€" />
            <StatCard magnetic label="Semana" value={parseFloat(data.week.hours) || 0} suffix="h" subvalue={parseFloat(data.week.estimated_money) || 0} subSuffix="€" />
            <StatCard magnetic label="Mes" value={parseFloat(data.month.hours) || 0} suffix="h" subvalue={parseFloat(data.month.estimated_money) || 0} subSuffix="€" />
            <StatCard magnetic label="Estimado hoy" value={parseFloat(data.today.estimated_money) || 0} suffix="€" subvalue={parseFloat(data.today.hours) || 0} subSuffix="h" />
          </div>
        </StaggeredGroup>

        {/* Welcome banner — static, no marquee */}
        {Number(data.month.hours) > 0 ? (
          <div className="animate-fade-up stagger-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
              <PiHandWaving className="shrink-0 text-base" />
              <span>
                Este mes llevas <span className="font-semibold text-text-primary">{formatHours(data.month.hours)}</span>
                {" · "}
                <span className="font-semibold text-text-primary">{formatMoney(data.month.estimated_money)}</span>
              </span>
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
                  className="mt-3 block text-center text-sm font-medium text-primary hover:text-primary-hover transition-colors"
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

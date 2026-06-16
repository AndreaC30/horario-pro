import { Link } from "react-router-dom";

import { ClientEarningsBreakdown } from "../components/domain/ClientEarningsBreakdown";
import { DrivingExtrasSummary } from "../components/domain/DrivingExtrasSummary";
import { ShiftList } from "../components/domain/ShiftList";
import { StatCard } from "../components/domain/StatCard";
import { ShineBorder } from "../components/effects/ShineBorder";
import { Marquee } from "../components/effects/Marquee";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Fab } from "../components/ui/Fab";
import { SkeletonBlock } from "../components/ui/SkeletonBlock";
import { useDashboard } from "../hooks/useDashboard";
import { formatMoney } from "../utils/money";
import { formatHours } from "../utils/time";

function todayLabel(): string {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function StaggeredGroup({ children }: { children: React.ReactNode }) {
  const childrenArr = React.Children.toArray(children);
  return (
    <>
      {childrenArr.map((child, i) => (
        <div key={i} className={`animate-fade-up`} style={{ animationDelay: `${i * 60}ms` }}>
          {child}
        </div>
      ))}
    </>
  );
}

import { PiHandWaving, PiRocketLaunch } from "react-icons/pi";
import React from "react";

export function DashboardPage() {
  const { data, loading, error, refresh } = useDashboard(5);

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

        {/* Marquee welcome */}
        <div className="animate-fade-up stagger-1">
          <Marquee speed="slower" pauseOnHover>
            <span className="mx-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary">
              <PiHandWaving className="inline shrink-0" /> Bienvenida a WorkShift · Registra tus jornadas fácilmente · Controla tus ingresos · 
              {Number(data.month.hours) > 0 ? ` Este mes llevas ${formatHours(data.month.hours)} · ` : " "}
              ¡A por ello! <PiRocketLaunch className="inline shrink-0" />
            </span>
          </Marquee>
        </div>

        {/* Desktop CTA */}
        <div className="hidden sm:block">
          <Link to="/jornada/nueva" className="block">
            <Button className="w-full">+ Nueva jornada</Button>
          </Link>
        </div>

        {/* Stats grid */}
        <StaggeredGroup>
          <div className="grid grid-cols-2 gap-3">
            <ShineBorder speed="slow"><StatCard magnetic label="Hoy" value={parseFloat(data.today.hours) || 0} suffix="h" subvalue={parseFloat(data.today.estimated_money) || 0} subSuffix="€" /></ShineBorder>
            <ShineBorder speed="slow"><StatCard magnetic label="Semana" value={parseFloat(data.week.hours) || 0} suffix="h" subvalue={parseFloat(data.week.estimated_money) || 0} subSuffix="€" /></ShineBorder>
            <ShineBorder speed="slow"><StatCard magnetic label="Mes" value={parseFloat(data.month.hours) || 0} suffix="h" subvalue={parseFloat(data.month.estimated_money) || 0} subSuffix="€" /></ShineBorder>
            <ShineBorder speed="slow"><StatCard magnetic label="Estimado hoy" value={parseFloat(data.today.estimated_money) || 0} suffix="€" subvalue={parseFloat(data.today.hours) || 0} subSuffix="h" /></ShineBorder>
          </div>
        </StaggeredGroup>

        {/* Client breakdown */}
        <div className="animate-fade-up stagger-2">
          <ClientEarningsBreakdown
            week={data.by_client_week ?? []}
            month={data.by_client_month ?? []}
          />
        </div>

        {/* Driving extras */}
        <div className="animate-fade-up stagger-3">
          <DrivingExtrasSummary
            today={data.today.driving_extras}
            week={data.week.driving_extras}
            month={data.month.driving_extras}
          />
        </div>

        {/* Recent shifts */}
        <div className="animate-fade-up stagger-4">
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
                <ShiftList shifts={data.recent_shifts} />
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

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

function todayLabel(): string {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DashboardPage() {
  const { data, loading, error, refresh } = useDashboard(5);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-16" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
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
        <header className="space-y-1">
          <p className="text-sm text-text-secondary">Hola</p>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary capitalize">{todayLabel()}</h2>
          <p className="text-sm text-text-secondary">
            Hoy: <span className="font-semibold text-text-primary">{formatHours(data.today.hours)}</span>
            {" · "}
            {formatMoney(data.today.estimated_money)}
          </p>
        </header>

        <div className="hidden sm:block">
          <Link to="/jornada/nueva" className="block">
            <Button className="w-full">+ Nueva jornada</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Hoy" value={formatHours(data.today.hours)} subvalue={formatMoney(data.today.estimated_money)} />
          <StatCard label="Semana" value={formatHours(data.week.hours)} subvalue={formatMoney(data.week.estimated_money)} />
          <StatCard label="Mes" value={formatHours(data.month.hours)} subvalue={formatMoney(data.month.estimated_money)} />
          <StatCard label="Estimado hoy" value={formatMoney(data.today.estimated_money)} />
        </div>

        <ClientEarningsBreakdown
          week={data.by_client_week ?? []}
          month={data.by_client_month ?? []}
        />

        <DrivingExtrasSummary
          today={data.today.driving_extras}
          week={data.week.driving_extras}
          month={data.month.driving_extras}
        />

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
              <Link to="/historial" className="mt-3 block text-center text-sm font-medium text-primary hover:text-primary-hover">
                Ver historial completo
              </Link>
            </>
          )}
        </Card>
      </div>

      <Fab to="/jornada/nueva" label="+ Nueva jornada" />
    </>
  );
}

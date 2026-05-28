import { Link } from "react-router-dom";

import { DrivingExtrasSummary } from "../components/domain/DrivingExtrasSummary";
import { ShiftList } from "../components/domain/ShiftList";
import { StatCard } from "../components/domain/StatCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { SkeletonBlock } from "../components/ui/SkeletonBlock";
import { useDashboard } from "../hooks/useDashboard";
import { formatMoney } from "../utils/money";
import { formatHours } from "../utils/time";

export function DashboardPage() {
  const { data, loading, error, refresh } = useDashboard(5);

  if (loading) {
    return (
      <div className="space-y-4">
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

  const isEmpty =
    data.recent_shifts.length === 0 &&
    Number(data.month.hours) === 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Hoy" value={formatHours(data.today.hours)} subvalue={formatMoney(data.today.estimated_money)} />
        <StatCard label="Semana" value={formatHours(data.week.hours)} subvalue={formatMoney(data.week.estimated_money)} />
        <StatCard label="Mes" value={formatHours(data.month.hours)} subvalue={formatMoney(data.month.estimated_money)} />
        <StatCard label="Estimado hoy" value={formatMoney(data.today.estimated_money)} />
      </div>

      <DrivingExtrasSummary
        today={data.today.driving_extras}
        week={data.week.driving_extras}
        month={data.month.driving_extras}
      />

      <Link to="/jornada/nueva" className="block">
        <Button className="w-full">+ Nueva jornada</Button>
      </Link>

      <Card title="Últimas jornadas">
        {isEmpty ? (
          <EmptyState
            title="Aún no hay jornadas"
            description="Crea un cliente y registra tu primera jornada."
            action={
              <Link to="/clientes">
                <Button variant="secondary">Gestionar clientes</Button>
              </Link>
            }
          />
        ) : (
          <>
            <ShiftList shifts={data.recent_shifts} />
            <Link to="/historial" className="mt-3 block text-center text-sm font-medium text-primary">
              Ver historial completo
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

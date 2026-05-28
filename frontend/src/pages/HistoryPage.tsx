import { useMemo, useState } from "react";

import { ShiftList } from "../components/domain/ShiftList";
import { Card } from "../components/ui/Card";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useShifts } from "../hooks/useShifts";

function monthBounds(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function HistoryPage() {
  const [monthOnly, setMonthOnly] = useState(true);
  const bounds = useMemo(() => (monthOnly ? monthBounds() : {}), [monthOnly]);
  const { shifts, loading, error, refresh } = useShifts({ ...bounds, limit: 100 });

  return (
    <div className="space-y-4">
      <Card>
        <label className="flex min-h-touch items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={monthOnly}
            onChange={(e) => setMonthOnly(e.target.checked)}
            className="h-4 w-4"
          />
          Solo mes actual
        </label>
      </Card>

      {loading ? <LoadingSpinner /> : null}
      {error ? <ErrorBanner message={error} onRetry={() => void refresh()} /> : null}
      {!loading && !error ? (
        <Card title="Historial">
          <ShiftList shifts={shifts} emptyTitle="No hay jornadas en este periodo" />
        </Card>
      ) : null}
    </div>
  );
}

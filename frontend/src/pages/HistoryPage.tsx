import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

import { ShiftList } from "../components/domain/ShiftList";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useShifts } from "../hooks/useShifts";
import { deleteShift } from "../services/shiftService";
import { TYPE_EYEBROW } from "../lib/typography";
import type { Shift } from "../types/api";
import { HISTORY_PRESETS } from "../utils/dateRanges";

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

export function HistoryPage() {
  const now = new Date();
  const [presetId, setPresetId] = useState("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [toDelete, setToDelete] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isCurrentMonth = isCurrentOrFuture(year, month);

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

  const bounds = useMemo(() => {
    if (presetId === "month") {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    const preset = HISTORY_PRESETS.find((item) => item.id === presetId);
    return preset?.getRange() ?? {};
  }, [presetId, year, month]);

  const { shifts, loading, error, refresh } = useShifts({ ...bounds, limit: 100 });

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteShift(toDelete.id);
      setToDelete(null);
      await refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const deleteSummary = toDelete
    ? `${new Date(toDelete.start_time).toLocaleDateString("es-ES")} · ${toDelete.client.name}`
    : "";

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
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
        <p className={TYPE_EYEBROW}>Periodo</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {HISTORY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`min-h-touch rounded-lg border px-3 text-sm font-medium transition ${
                presetId === preset.id
                  ? "border-primary bg-primary text-primary-foreground shadow-card"
                  : "border-border bg-[var(--bg-soft)] text-text-secondary hover:border-[var(--border-hover)] hover:text-text-primary"
              }`}
              onClick={() => setPresetId(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Card>

      {loading ? <LoadingSpinner /> : null}
      {error ? <ErrorBanner message={error} onRetry={() => void refresh()} /> : null}
      {!loading && !error ? (
        <Card title="Historial">
          <ShiftList
            shifts={shifts}
            emptyTitle="Aún no hay jornadas"
            emptyDescription="Registra tu primera jornada o cambia el filtro de fechas."
            showDelete
            embedded
            onDelete={(shift) => {
              setDeleteError(null);
              setToDelete(shift);
            }}
            emptyAction={
              <Link to="/jornada/nueva">
                <Button className="w-full">+ Nueva jornada</Button>
              </Link>
            }
          />
        </Card>
      ) : null}

      <ConfirmModal
        open={Boolean(toDelete)}
        title="Eliminar jornada"
        confirmLabel="Eliminar"
        loading={deleting}
        error={deleteError}
        onClose={() => {
          if (!deleting) {
            setToDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => void handleConfirmDelete()}
      >
        ¿Eliminar la jornada del <strong className="text-text-primary">{deleteSummary}</strong>? No se puede deshacer.
      </ConfirmModal>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ShiftList } from "../components/domain/ShiftList";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useShifts } from "../hooks/useShifts";
import { deleteShift } from "../services/shiftService";
import type { Shift } from "../types/api";
import { HISTORY_PRESETS } from "../utils/dateRanges";

export function HistoryPage() {
  const [presetId, setPresetId] = useState("month");
  const [toDelete, setToDelete] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const bounds = useMemo(() => {
    const preset = HISTORY_PRESETS.find((item) => item.id === presetId);
    return preset?.getRange() ?? {};
  }, [presetId]);

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
        <p className="mb-2 text-sm font-medium text-text-secondary">Periodo</p>
        <div className="flex flex-wrap gap-2">
          {HISTORY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`min-h-touch rounded-full border px-4 text-sm font-medium transition ${
                presetId === preset.id
                  ? "border-primary bg-primary text-white shadow-card"
                  : "border-border bg-white/[0.03] text-text-secondary hover:border-white/20"
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

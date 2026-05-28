import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ShiftList } from "../components/domain/ShiftList";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Modal } from "../components/ui/Modal";
import { useShifts } from "../hooks/useShifts";
import { deleteShift } from "../services/shiftService";
import type { Shift } from "../types/api";
import { HISTORY_PRESETS } from "../utils/dateRanges";

export function HistoryPage() {
  const [presetId, setPresetId] = useState("month");
  const [toDelete, setToDelete] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState(false);

  const bounds = useMemo(() => {
    const preset = HISTORY_PRESETS.find((item) => item.id === presetId);
    return preset?.getRange() ?? {};
  }, [presetId]);

  const { shifts, loading, error, refresh } = useShifts({ ...bounds, limit: 100 });

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteShift(toDelete.id);
      setToDelete(null);
      await refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "No se pudo eliminar");
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
        <p className="mb-2 text-sm font-medium text-slate-700">Periodo</p>
        <div className="flex flex-wrap gap-2">
          {HISTORY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`min-h-touch rounded-full border px-4 text-sm font-medium ${
                presetId === preset.id
                  ? "border-primary bg-primary text-white"
                  : "border-slate-300 bg-white text-slate-700"
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
            onDelete={setToDelete}
            emptyAction={
              <Link to="/jornada/nueva">
                <Button className="w-full">+ Nueva jornada</Button>
              </Link>
            }
          />
        </Card>
      ) : null}

      <Modal open={Boolean(toDelete)} title="Eliminar jornada" onClose={() => setToDelete(null)}>
        <p className="mb-4 text-sm text-slate-600">
          ¿Eliminar la jornada del <strong>{deleteSummary}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" type="button" onClick={() => setToDelete(null)}>
            Cancelar
          </Button>
          <Button className="flex-1" type="button" loading={deleting} onClick={() => void handleConfirmDelete()}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

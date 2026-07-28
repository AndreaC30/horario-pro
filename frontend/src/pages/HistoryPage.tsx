import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

import { ShiftList } from "../components/domain/ShiftList";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useClients } from "../hooks/useClients";
import { useShifts } from "../hooks/useShifts";
import { TYPE_DISPLAY, TYPE_EYEBROW } from "../lib/typography";
import { deleteShift, exportShiftsCsv } from "../services/shiftService";
import type { Shift } from "../types/api";
import { HISTORY_PRESETS, lastMonthBounds, monthBounds } from "../utils/dateRanges";

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
  const [clientFilterId, setClientFilterId] = useState<number | "">("");
  const [toDelete, setToDelete] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { clients } = useClients();
  const isCurrentMonth = isCurrentOrFuture(year, month);

  const goPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
    setPresetId("month");
  };

  const goNextMonth = () => {
    if (isCurrentMonth) return;
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
    setPresetId("month");
  };

  const bounds = useMemo(() => {
    if (presetId === "month") {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    if (presetId === "last_month") {
      return lastMonthBounds();
    }
    const preset = HISTORY_PRESETS.find((item) => item.id === presetId);
    return preset?.getRange() ?? monthBounds();
  }, [presetId, year, month]);

  const query = useMemo(
    () => ({
      ...bounds,
      limit: 100,
      clientId: clientFilterId === "" ? undefined : clientFilterId,
    }),
    [bounds, clientFilterId],
  );

  const { shifts, loading, error, refresh } = useShifts(query);

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

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const csv = await exportShiftsCsv({
        from: bounds.from,
        to: bounds.to,
        client_id: clientFilterId === "" ? undefined : clientFilterId,
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "workshift-jornadas.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "No se pudo exportar");
    } finally {
      setExporting(false);
    }
  };

  const deleteSummary = toDelete
    ? `${new Date(toDelete.start_time).toLocaleDateString("es-ES")} · ${toDelete.client.name}`
    : "";

  const quickFilters = [
    { id: "month", label: "Este mes" },
    { id: "last_month", label: "Mes pasado" },
    { id: "week", label: "Esta semana" },
  ];

  return (
    <div className="space-y-8 pb-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className={TYPE_EYEBROW}>Periodo</p>
            <h2 className={`${TYPE_DISPLAY} mt-0.5 capitalize`}>{monthLabel(year, month)}</h2>
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

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros rápidos">
          {quickFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`min-h-11 rounded-lg px-3 text-sm font-medium transition ${
                presetId === f.id
                  ? "bg-primary text-white"
                  : "bg-[var(--bg-soft)] text-text-primary hover:bg-[var(--bg-surface-elevated)]"
              }`}
              onClick={() => {
                setPresetId(f.id);
                if (f.id === "month") {
                  setYear(now.getFullYear());
                  setMonth(now.getMonth() + 1);
                }
              }}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            className={`min-h-11 rounded-lg px-3 text-sm font-medium transition ${
              clientFilterId !== ""
                ? "bg-primary text-white"
                : "bg-[var(--bg-soft)] text-text-primary hover:bg-[var(--bg-surface-elevated)]"
            }`}
            onClick={() => {
              if (clientFilterId !== "") {
                setClientFilterId("");
                return;
              }
              if (clients[0]) setClientFilterId(clients[0].id);
            }}
          >
            Este cliente
          </button>
        </div>

        {clientFilterId !== "" ? (
          <select
            className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 text-sm"
            value={clientFilterId}
            onChange={(e) => setClientFilterId(Number(e.target.value))}
            aria-label="Cliente"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : null}

        <div
          className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--bg-soft)] p-1"
          role="tablist"
          aria-label="Filtro de fechas"
        >
          {HISTORY_PRESETS.filter((p) => p.id !== "last_month").map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="tab"
              aria-selected={presetId === preset.id}
              className={`min-h-11 rounded-lg px-2 text-sm font-medium transition ${
                presetId === preset.id
                  ? "bg-surface text-text-primary shadow-card"
                  : "text-text-muted hover:text-text-primary"
              }`}
              onClick={() => setPresetId(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" loading={exporting} onClick={() => void handleExport()}>
            Exportar CSV
          </Button>
          <Link to="/calendario" className="contents">
            <Button type="button" variant="ghost">
              Ver calendario
            </Button>
          </Link>
        </div>
        {exportError ? <p className="text-sm text-danger">{exportError}</p> : null}
      </section>

      <section className="space-y-3">
        <div>
          <p className={TYPE_EYEBROW}>Listado</p>
          <h2 className={`${TYPE_DISPLAY} mt-0.5`}>Jornadas</h2>
        </div>

        {loading ? <LoadingSpinner /> : null}
        {error ? <ErrorBanner message={error} onRetry={() => void refresh()} /> : null}
        {!loading && !error ? (
          <div className="border-t border-border/70 pt-3">
            <ShiftList
              shifts={shifts}
              emptyTitle="Aún no hay jornadas"
              emptyDescription="Registra tu primera jornada o cambia el filtro de fechas."
              showDelete
              showDuplicate
              embedded
              onDelete={(shift) => {
                setDeleteError(null);
                setToDelete(shift);
              }}
              emptyAction={
                <Link to="/jornada/nueva" state={{ from: "/historial" }}>
                  <Button className="w-full">+ Nueva jornada</Button>
                </Link>
              }
            />
          </div>
        ) : null}
      </section>

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

import { FormEvent, useEffect, useMemo, useState } from "react";

import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import type { Client, ShiftInput } from "../../types/api";
import { OFFLINE_MESSAGE } from "../../utils/network";
import { previewShift, validateShiftFields } from "../../utils/shiftForm";
import { formatEstimatedPay, formatMoney } from "../../utils/money";
import {
  defaultShiftTimes,
  formatHours,
  fromDatetimeLocalValue,
  getLastClientId,
  setEndToNow,
  setLastClientId,
  setStartHoursAgo,
  toDatetimeLocalValue,
} from "../../utils/time";
import { Button } from "../ui/Button";
import { Collapsible } from "../ui/Collapsible";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { ClientSelect } from "./ClientSelect";

type ShiftQuickFormProps = {
  clients: Client[];
  initial?: Partial<ShiftInput> & { id?: number };
  preferredClientId?: number;
  onSubmit: (data: ShiftInput) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onRequestNewClient?: () => void;
};

export function ShiftQuickForm({
  clients,
  initial,
  preferredClientId,
  onSubmit,
  onDirtyChange,
  onRequestNewClient,
}: ShiftQuickFormProps) {
  const defaults = defaultShiftTimes();
  const [clientId, setClientId] = useState<number | "">(
    initial?.client_id ?? getLastClientId() ?? (clients[0]?.id ?? ""),
  );
  const [startTime, setStartTime] = useState(
    initial?.start_time ? toDatetimeLocalValue(initial.start_time) : toDatetimeLocalValue(defaults.start),
  );
  const [endTime, setEndTime] = useState(
    initial?.end_time ? toDatetimeLocalValue(initial.end_time) : toDatetimeLocalValue(defaults.end),
  );
  const [breakMinutes, setBreakMinutes] = useState(String(initial?.break_minutes ?? 0));
  const initialDriving = Number(initial?.driving_extra ?? 0);
  const [drivingEnabled, setDrivingEnabled] = useState(initialDriving > 0);
  const [drivingExtra, setDrivingExtra] = useState(String(initialDriving || ""));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    if (preferredClientId) {
      setClientId(preferredClientId);
    }
  }, [preferredClientId]);

  const markDirty = () => onDirtyChange?.(true);

  const selectedClient = clients.find((client) => client.id === clientId);
  const breakNum = Number(breakMinutes) || 0;
  const drivingNum = drivingEnabled ? Number(drivingExtra) || 0 : 0;

  const fieldErrors = useMemo(
    () => (touched ? validateShiftFields(clientId, startTime, endTime, breakNum) : {}),
    [touched, clientId, startTime, endTime, breakNum],
  );

  const preview = useMemo(
    () => previewShift(selectedClient, startTime, endTime, breakNum, drivingNum),
    [selectedClient, startTime, endTime, breakNum, drivingNum],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    const errors = validateShiftFields(clientId, startTime, endTime, breakNum);
    if (Object.keys(errors).length > 0) {
      return;
    }
    if (!clientId) {
      return;
    }

    setSubmitError(null);
    setLoading(true);
    try {
      const payload: ShiftInput = {
        client_id: clientId,
        start_time: fromDatetimeLocalValue(startTime),
        end_time: fromDatetimeLocalValue(endTime),
        break_minutes: breakNum,
        driving_extra: drivingNum,
        notes: notes.trim() || null,
      };
      await onSubmit(payload);
      setLastClientId(clientId);
      onDirtyChange?.(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo guardar la jornada");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <ClientSelect
        clients={clients}
        value={clientId}
        onChange={(id) => {
          setClientId(id);
          markDirty();
        }}
        error={fieldErrors.client}
        onNewClient={onRequestNewClient}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="start_time">Hora inicio</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              markDirty();
            }}
            required
            aria-invalid={Boolean(fieldErrors.start)}
          />
          {fieldErrors.start ? <p className="mt-1 text-sm text-danger">{fieldErrors.start}</p> : null}
        </div>
        <div>
          <Label htmlFor="end_time">Hora fin</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              markDirty();
            }}
            required
            aria-invalid={Boolean(fieldErrors.end)}
          />
          {fieldErrors.end ? <p className="mt-1 text-sm text-danger">{fieldErrors.end}</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-touch rounded-lg bg-[var(--bg-soft)] px-3 text-sm font-medium text-text-primary transition hover:bg-[var(--bg-surface-elevated)]"
          onClick={() => {
            setEndTime(setEndToNow());
            markDirty();
          }}
        >
          Ahora (fin)
        </button>
        <button
          type="button"
          className="min-h-touch rounded-lg bg-[var(--bg-soft)] px-3 text-sm font-medium text-text-primary transition hover:bg-[var(--bg-surface-elevated)]"
          onClick={() => {
            setStartTime(setStartHoursAgo(8));
            markDirty();
          }}
        >
          Hace 8 h (inicio)
        </button>
      </div>

      {preview ? (
        <p className="rounded-xl bg-[var(--bg-soft)] px-3 py-2.5 text-sm text-text-secondary">
          {drivingEnabled ? (
            <>
              Conducción:{" "}
              <strong className="text-text-primary">
                {drivingNum > 0 ? formatMoney(drivingNum) : "indica el importe"}
              </strong>
            </>
          ) : (
            <>
              Vista previa:{" "}
              <strong className="tabular-nums text-text-primary">{formatHours(preview.hours)}</strong>
              {" · "}
              <strong className="tabular-nums text-text-primary">
                {preview.pay !== null
                  ? formatEstimatedPay(preview.pay, selectedClient?.hourly_rate)
                  : "sin tarifa"}
              </strong>
            </>
          )}
        </p>
      ) : null}

      <Collapsible label="Opciones (descanso, notas, conducción)">
        <div>
          <Label htmlFor="break_minutes">Descanso (min)</Label>
          <Input
            id="break_minutes"
            type="number"
            min={0}
            inputMode="numeric"
            value={breakMinutes}
            onChange={(e) => {
              setBreakMinutes(e.target.value);
              markDirty();
            }}
            onBlur={() => {
              if (Number(breakMinutes) < 0) {
                setBreakMinutes("0");
              }
            }}
            aria-invalid={Boolean(fieldErrors.break)}
          />
          {fieldErrors.break ? <p className="mt-1 text-sm text-danger">{fieldErrors.break}</p> : null}
        </div>

        <label className="flex min-h-touch cursor-pointer items-center gap-2 text-sm font-medium text-text-primary">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-border accent-primary"
            checked={drivingEnabled}
            onChange={(e) => {
              setDrivingEnabled(e.target.checked);
              if (!e.target.checked) {
                setDrivingExtra("");
              }
              markDirty();
            }}
          />
          Conducción
        </label>

        {drivingEnabled ? (
          <div>
            <Label htmlFor="driving_extra">Extra conducción (€)</Label>
            <Input
              id="driving_extra"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={drivingExtra}
              onChange={(e) => {
                setDrivingExtra(e.target.value);
                markDirty();
              }}
            />
          </div>
        ) : null}

        <div>
          <Label htmlFor="notes">Notas</Label>
          <Input
            id="notes"
            value={notes}
            placeholder="Añadir nota (opcional)"
            onChange={(e) => {
              setNotes(e.target.value);
              markDirty();
            }}
          />
        </div>
      </Collapsible>

      {!online ? <p className="text-sm text-warning">{OFFLINE_MESSAGE}</p> : null}
      {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}

      <Button type="submit" className="w-full" loading={loading} disabled={!online}>
        Guardar jornada
      </Button>
    </form>
  );
}

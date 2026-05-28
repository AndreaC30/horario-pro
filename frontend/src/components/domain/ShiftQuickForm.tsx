import { FormEvent, useState } from "react";

import type { Client, ShiftInput } from "../../types/api";
import {
  defaultShiftTimes,
  fromDatetimeLocalValue,
  getLastClientId,
  setLastClientId,
  toDatetimeLocalValue,
} from "../../utils/time";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { ClientSelect } from "./ClientSelect";

type ShiftQuickFormProps = {
  clients: Client[];
  initial?: Partial<ShiftInput> & { id?: number };
  onSubmit: (data: ShiftInput) => Promise<void>;
};

export function ShiftQuickForm({ clients, initial, onSubmit }: ShiftQuickFormProps) {
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
  const [drivingExtra, setDrivingExtra] = useState(String(initial?.driving_extra ?? 0));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!clientId) {
      setError("Selecciona un cliente");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload: ShiftInput = {
        client_id: clientId,
        start_time: fromDatetimeLocalValue(startTime),
        end_time: fromDatetimeLocalValue(endTime),
        break_minutes: Number(breakMinutes) || 0,
        driving_extra: Number(drivingExtra) || 0,
        notes: notes.trim() || null,
      };
      await onSubmit(payload);
      setLastClientId(clientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la jornada");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <ClientSelect clients={clients} value={clientId} onChange={setClientId} error={error && !clientId ? error : undefined} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="start_time">Inicio</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="end_time">Fin</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="break_minutes">Descanso (min)</Label>
          <Input
            id="break_minutes"
            type="number"
            min={0}
            inputMode="numeric"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="driving_extra">Extra conducción (€)</Label>
          <Input
            id="driving_extra"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={drivingExtra}
            onChange={(e) => setDrivingExtra(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {error && clientId ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" loading={loading}>
        Guardar jornada
      </Button>
    </form>
  );
}

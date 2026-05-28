import { FormEvent, useState } from "react";

import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import type { Client, ClientInput } from "../../types/api";
import { OFFLINE_MESSAGE } from "../../utils/network";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { ColorPicker } from "./ColorPicker";

type ClientFormProps = {
  initial?: Client;
  onSubmit: (data: ClientInput) => Promise<void>;
  onCancel: () => void;
};

export function ClientForm({ initial, onSubmit, onCancel }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? "#7C5CFF");
  const [hourlyRate, setHourlyRate] = useState(initial?.hourly_rate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const online = useOnlineStatus();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        name,
        color,
        hourly_rate: hourlyRate === "" ? null : Number(hourlyRate),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="client-name">Nombre</Label>
        <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Color</Label>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div>
        <Label htmlFor="hourly-rate">Tarifa / hora (€, opcional)</Label>
        <Input
          id="hourly-rate"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
        />
      </div>
      {!online ? <p className="text-sm text-warning">{OFFLINE_MESSAGE}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" loading={loading} disabled={!online}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

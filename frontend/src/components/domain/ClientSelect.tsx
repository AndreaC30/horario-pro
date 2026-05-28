import { Link } from "react-router-dom";

import type { Client } from "../../types/api";
import { Label } from "../ui/Label";

type ClientSelectProps = {
  clients: Client[];
  value: number | "";
  onChange: (clientId: number) => void;
  error?: string;
  onNewClient?: () => void;
};

export function ClientSelect({ clients, value, onChange, error, onNewClient }: ClientSelectProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
        <p>Crea tu primer cliente antes de registrar una jornada.</p>
        {onNewClient ? (
          <button type="button" className="mt-2 font-semibold text-primary underline" onClick={onNewClient}>
            + Nuevo cliente
          </button>
        ) : (
          <Link to="/clientes" className="mt-2 inline-block font-semibold text-primary underline">
            Crear cliente
          </Link>
        )}
      </div>
    );
  }

  const selected = clients.find((client) => client.id === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="client_id">Cliente / lugar</Label>
        {onNewClient ? (
          <button
            type="button"
            className="min-h-touch text-sm font-semibold text-primary"
            onClick={onNewClient}
          >
            + Nuevo cliente
          </button>
        ) : null}
      </div>
      {selected ? (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-slate-200"
            style={{ backgroundColor: selected.color }}
            aria-hidden
          />
          <span className="truncate font-medium text-slate-800">{selected.name}</span>
        </div>
      ) : null}
      <select
        id="client_id"
        className={`min-h-touch w-full rounded-xl border px-3 py-2 text-base ${
          error ? "border-red-500" : "border-slate-300"
        }`}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        required
      >
        <option value="" disabled>
          Selecciona un cliente
        </option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

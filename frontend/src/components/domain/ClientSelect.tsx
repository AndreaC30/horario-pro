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
      <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-3 text-sm text-warning">
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
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: selected.color }}
            aria-hidden
          />
          <span className="truncate font-medium text-text-primary">{selected.name}</span>
        </div>
      ) : null}
      <select
        id="client_id"
        className={`glass-input ${error ? "border-danger" : ""}`}
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
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

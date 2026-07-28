import type { Client } from "../../types/api";
import { formatMoney } from "../../utils/money";
import { EmptyState } from "../ui/EmptyState";

type ClientListProps = {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
};

export function ClientList({ clients, onEdit, onDelete }: ClientListProps) {
  if (clients.length === 0) {
    return <EmptyState title="Sin clientes" description="Añade un cliente para registrar jornadas." />;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {clients.map((client) => (
        <li
          key={client.id}
          className="list-item min-w-0 justify-between gap-2 !py-2.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: client.color }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{client.name}</p>
              <p className="truncate text-xs text-text-muted">
                {client.hourly_rate ? `${formatMoney(client.hourly_rate)}/h` : "Sin tarifa"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-0.5">
            <button
              type="button"
              className="min-h-touch rounded-lg px-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              onClick={() => onEdit(client)}
            >
              Editar
            </button>
            <button
              type="button"
              className="min-h-touch rounded-lg px-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              onClick={() => onDelete(client)}
            >
              Borrar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

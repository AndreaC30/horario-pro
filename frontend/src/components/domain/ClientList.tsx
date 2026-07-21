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
    <ul className="divide-y divide-border">
      {clients.map((client) => (
        <li
          key={client.id}
          className="flex min-h-[2.75rem] flex-wrap items-center gap-3 px-2 py-2.5 transition-colors hover:bg-accent-muted/50 sm:flex-nowrap"
        >
          <span className="h-8 w-8 shrink-0 rounded-full border border-border" style={{ backgroundColor: client.color }} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">{client.name}</p>
            <p className="text-xs text-text-secondary">
              {client.hourly_rate ? `${formatMoney(client.hourly_rate)}/h` : "Sin tarifa"}
            </p>
          </div>
          <div className="flex w-full gap-1 sm:w-auto">
            <button
              type="button"
              className="min-h-touch rounded-lg px-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => onEdit(client)}
            >
              Editar
            </button>
            <button
              type="button"
              className="min-h-touch rounded-lg px-2 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
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

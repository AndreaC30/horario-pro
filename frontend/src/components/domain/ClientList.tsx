import type { Client } from "../../types/api";
import { formatMoney } from "../../utils/money";
import { Button } from "../ui/Button";
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
    <ul className="space-y-2">
      {clients.map((client) => (
        <li
          key={client.id}
          className="flex min-h-touch flex-wrap items-center gap-3 rounded-xl border border-border bg-white/[0.02] px-3 py-3 sm:flex-nowrap"
        >
          <span className="h-8 w-8 shrink-0 rounded-full border border-border" style={{ backgroundColor: client.color }} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-primary">{client.name}</p>
            <p className="text-xs text-text-secondary">
              {client.hourly_rate ? `${formatMoney(client.hourly_rate)}/h` : "Sin tarifa"}
            </p>
          </div>
          <div className="flex w-full gap-1 sm:w-auto">
            <Button variant="ghost" type="button" onClick={() => onEdit(client)}>
              Editar
            </Button>
            <Button variant="ghost" type="button" className="text-danger" onClick={() => onDelete(client)}>
              Borrar
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

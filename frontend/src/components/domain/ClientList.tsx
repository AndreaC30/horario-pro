import type { Client } from "../../types/api";
import { formatMoney } from "../../utils/money";
import { EmptyState } from "../ui/EmptyState";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

type ClientListProps = {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onArchive?: (client: Client) => void;
  onUnarchive?: (client: Client) => void;
  showArchived?: boolean;
};

export function ClientList({
  clients,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  showArchived = false,
}: ClientListProps) {
  if (clients.length === 0) {
    return (
      <EmptyState
        title={showArchived ? "Sin clientes archivados" : "Sin clientes"}
        description={
          showArchived
            ? "Los clientes archivados aparecen aquí."
            : "Añade un cliente para registrar jornadas."
        }
        action={
          showArchived ? undefined : (
            <Link to="/clientes/nuevo">
              <Button className="w-full">+ Nuevo cliente</Button>
            </Link>
          )
        }
      />
    );
  }

  return (
    <ul className="divide-y divide-border/80">
      {clients.map((client) => {
        const archived = Boolean(client.archived_at);
        return (
          <li
            key={client.id}
            className="flex min-h-touch items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: client.color }}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {client.name}
                  {archived ? (
                    <span className="ml-2 font-mono text-[0.65rem] text-text-muted">Archivado</span>
                  ) : null}
                </p>
                <p className="truncate font-mono text-xs text-text-muted">
                  {client.hourly_rate ? `${formatMoney(client.hourly_rate)}/h` : "Sin tarifa"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-0.5">
              {!archived ? (
                <>
                  <button
                    type="button"
                    className="min-h-touch rounded-lg px-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                    onClick={() => onEdit(client)}
                  >
                    Editar
                  </button>
                  {onArchive ? (
                    <button
                      type="button"
                      className="min-h-touch rounded-lg px-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                      onClick={() => onArchive(client)}
                    >
                      Archivar
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="min-h-touch rounded-lg px-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                    onClick={() => onDelete(client)}
                  >
                    Borrar
                  </button>
                </>
              ) : onUnarchive ? (
                <button
                  type="button"
                  className="min-h-touch rounded-lg px-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                  onClick={() => onUnarchive(client)}
                >
                  Restaurar
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

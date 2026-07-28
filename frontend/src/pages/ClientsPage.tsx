import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ClientList } from "../components/domain/ClientList";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useClients } from "../hooks/useClients";
import { TYPE_DISPLAY, TYPE_EYEBROW } from "../lib/typography";
import type { Client } from "../types/api";

export function ClientsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showArchived, setShowArchived] = useState(false);
  const { clients, loading, error, refresh, remove, archive, unarchive } = useClients(true);
  const [toDelete, setToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      clients.filter((c) => (showArchived ? Boolean(c.archived_at) : !c.archived_at)),
    [clients, showArchived],
  );

  const closeDeleteModal = () => {
    if (deleting) return;
    setToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await remove(toDelete.id);
      setToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={TYPE_EYEBROW}>Agenda</p>
            <h2 className={`${TYPE_DISPLAY} mt-0.5`}>Clientes</h2>
          </div>
          <Button
            className="w-full sm:w-auto"
            type="button"
            onClick={() =>
              navigate("/clientes/nuevo", { state: { from: location.pathname } })
            }
          >
            + Nuevo cliente
          </Button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className={`min-h-11 rounded-lg px-3 text-sm font-medium ${
              !showArchived ? "bg-primary text-white" : "bg-[var(--bg-soft)] text-text-primary"
            }`}
            onClick={() => setShowArchived(false)}
          >
            Activos
          </button>
          <button
            type="button"
            className={`min-h-11 rounded-lg px-3 text-sm font-medium ${
              showArchived ? "bg-primary text-white" : "bg-[var(--bg-soft)] text-text-primary"
            }`}
            onClick={() => setShowArchived(true)}
          >
            Archivados
          </button>
        </div>

        {loading ? <LoadingSpinner /> : null}
        {error ? <ErrorBanner message={error} onRetry={() => void refresh()} /> : null}

        {!loading && !error ? (
          <div className="border-t border-border/70 pt-3">
            <ClientList
              clients={visible}
              showArchived={showArchived}
              onEdit={(client) =>
                navigate(`/clientes/${client.id}/editar`, {
                  state: { from: location.pathname },
                })
              }
              onDelete={(client) => {
                setDeleteError(null);
                setToDelete(client);
              }}
              onArchive={(client) => void archive(client.id)}
              onUnarchive={(client) => void unarchive(client.id)}
            />
          </div>
        ) : null}
      </section>

      <ConfirmModal
        open={Boolean(toDelete)}
        title="Eliminar cliente"
        confirmLabel="Eliminar"
        loading={deleting}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={() => void handleConfirmDelete()}
      >
        ¿Eliminar <strong className="text-text-primary">{toDelete?.name}</strong>? Si tiene jornadas
        registradas, archívalo en su lugar (el historial conserva el nombre).
      </ConfirmModal>
    </div>
  );
}

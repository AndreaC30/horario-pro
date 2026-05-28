import { useState } from "react";

import { ClientForm } from "../components/domain/ClientForm";
import { ClientList } from "../components/domain/ClientList";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Modal } from "../components/ui/Modal";
import { useClients } from "../hooks/useClients";
import type { Client } from "../types/api";

export function ClientsPage() {
  const { clients, loading, error, refresh, add, update, remove } = useClients();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [toDelete, setToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setModalOpen(true);
  };

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
    <div className="space-y-4">
      <Button className="w-full" type="button" onClick={openCreate}>
        + Nuevo cliente
      </Button>

      {loading ? <LoadingSpinner /> : null}
      {error ? <ErrorBanner message={error} onRetry={() => void refresh()} /> : null}

      {!loading && !error ? (
        <Card title="Clientes">
          <ClientList
            clients={clients}
            onEdit={openEdit}
            onDelete={(client) => {
              setDeleteError(null);
              setToDelete(client);
            }}
          />
        </Card>
      ) : null}

      <ConfirmModal
        open={Boolean(toDelete)}
        title="Eliminar cliente"
        confirmLabel="Eliminar"
        loading={deleting}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={() => void handleConfirmDelete()}
      >
        ¿Eliminar <strong className="text-text-primary">{toDelete?.name}</strong>? Si tiene jornadas registradas, elimínalas
        antes desde Historial.
      </ConfirmModal>

      <Modal open={modalOpen} title={editing ? "Editar cliente" : "Nuevo cliente"} onClose={() => setModalOpen(false)}>
        <ClientForm
          initial={editing ?? undefined}
          onCancel={() => setModalOpen(false)}
          onSubmit={async (data) => {
            if (editing) {
              await update(editing.id, data);
            } else {
              await add(data);
            }
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

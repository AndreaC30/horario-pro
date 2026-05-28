import { useState } from "react";

import { ClientForm } from "../components/domain/ClientForm";
import { ClientList } from "../components/domain/ClientList";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Modal } from "../components/ui/Modal";
import { useClients } from "../hooks/useClients";
import type { Client } from "../types/api";

export function ClientsPage() {
  const { clients, loading, error, refresh, add, update, remove } = useClients();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setModalOpen(true);
  };

  const handleDelete = async (client: Client) => {
    if (!window.confirm(`¿Eliminar "${client.name}"?`)) return;
    try {
      await remove(client.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar");
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
          <ClientList clients={clients} onEdit={openEdit} onDelete={handleDelete} />
        </Card>
      ) : null}

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

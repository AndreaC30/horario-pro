import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ClientForm } from "../components/domain/ClientForm";
import { ShiftQuickForm } from "../components/domain/ShiftQuickForm";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Modal } from "../components/ui/Modal";
import { Toast } from "../components/ui/Toast";
import { useClients } from "../hooks/useClients";
import { useUnsavedGuard } from "../hooks/useUnsavedGuard";
import { TYPE_BODY, TYPE_DISPLAY, TYPE_EYEBROW } from "../lib/typography";
import { createShift, getShift, updateShift } from "../services/shiftService";
import type { ShiftInput } from "../types/api";

export function ShiftFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { clients, loading: clientsLoading, error: clientsError, add } = useClients();
  const [initial, setInitial] = useState<Partial<ShiftInput> | undefined>(undefined);
  const [loadingShift, setLoadingShift] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [newClientId, setNewClientId] = useState<number | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useUnsavedGuard(dirty);

  useEffect(() => {
    if (!id) return;
    setLoadingShift(true);
    getShift(Number(id))
      .then((shift) => {
        setInitial({
          client_id: shift.client_id,
          start_time: shift.start_time,
          end_time: shift.end_time,
          break_minutes: shift.break_minutes,
          driving_extra: Number(shift.driving_extra),
          notes: shift.notes,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingShift(false));
  }, [id]);

  const handleSubmit = async (data: ShiftInput) => {
    if (isEdit && id) {
      await updateShift(Number(id), data);
      setToastMessage("Jornada actualizada");
    } else {
      await createShift(data);
      setToastMessage("Jornada guardada");
    }
    setDirty(false);
    window.setTimeout(() => navigate("/dashboard", { replace: true }), 450);
  };

  if (clientsLoading || loadingShift) {
    return <LoadingSpinner />;
  }

  if (clientsError) {
    return <ErrorBanner message={clientsError} />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  return (
    <>
      <div className="space-y-6 pb-8">
        <div>
          <p className={TYPE_EYEBROW}>Registro</p>
          <h2 className={`${TYPE_DISPLAY} mt-0.5`}>
            {isEdit ? "Editar jornada" : "Nueva jornada"}
          </h2>
          <p className={`${TYPE_BODY} mt-1`}>
            {isEdit
              ? "Ajusta los datos y guarda los cambios."
              : "Cliente, inicio y fin. El resto es opcional."}
          </p>
        </div>

        <div className="border-t border-border/70 pt-4">
          {clients.length === 0 && !isEdit ? (
            <EmptyState
              title="Primero necesitas un cliente"
              description="Crea al menos un cliente o lugar para poder registrar horas."
              action={
                <Button type="button" className="w-full" onClick={() => setClientModalOpen(true)}>
                  + Nuevo cliente
                </Button>
              }
            />
          ) : (
            <ShiftQuickForm
              clients={clients}
              initial={initial}
              preferredClientId={newClientId}
              onSubmit={handleSubmit}
              onDirtyChange={setDirty}
              onRequestNewClient={() => setClientModalOpen(true)}
            />
          )}
          {clients.length === 0 ? (
            <Link
              to="/clientes"
              className="mt-3 block text-center text-sm font-medium text-primary no-underline hover:text-primary-hover"
            >
              Ir a gestión de clientes
            </Link>
          ) : null}
        </div>
      </div>

      <Modal open={clientModalOpen} title="Nuevo cliente" onClose={() => setClientModalOpen(false)}>
        <ClientForm
          onCancel={() => setClientModalOpen(false)}
          onSubmit={async (data) => {
            const created = await add(data);
            setNewClientId(created.id);
            setClientModalOpen(false);
          }}
        />
      </Modal>

      <Toast message={toastMessage ?? ""} visible={Boolean(toastMessage)} />
    </>
  );
}

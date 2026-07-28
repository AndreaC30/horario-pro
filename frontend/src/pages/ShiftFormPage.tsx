import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { ShiftQuickForm } from "../components/domain/ShiftQuickForm";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Toast } from "../components/ui/Toast";
import { useClients } from "../hooks/useClients";
import { useUnsavedGuard } from "../hooks/useUnsavedGuard";
import { TYPE_BODY, TYPE_DISPLAY, TYPE_EYEBROW } from "../lib/typography";
import { createShift, getShift, updateShift } from "../services/shiftService";
import type { ShiftInput } from "../types/api";

type LocationState = {
  preferredClientId?: number;
};

export function ShiftFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const { clients, loading: clientsLoading, error: clientsError } = useClients();
  const [initial, setInitial] = useState<Partial<ShiftInput> | undefined>(undefined);
  const [loadingShift, setLoadingShift] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [preferredClientId, setPreferredClientId] = useState<number | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useUnsavedGuard(dirty);

  useEffect(() => {
    const preferred = (location.state as LocationState | null)?.preferredClientId;
    if (preferred) {
      setPreferredClientId(preferred);
    }
  }, [location.state]);

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

  const openNewClient = () => {
    navigate("/clientes/nuevo", { state: { from: location.pathname } });
  };

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
      <div className="space-y-6 pb-8" data-tour="jornada-form">
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
                <Button type="button" className="w-full" onClick={openNewClient}>
                  + Nuevo cliente
                </Button>
              }
            />
          ) : (
            <ShiftQuickForm
              clients={clients}
              initial={initial}
              preferredClientId={preferredClientId}
              onSubmit={handleSubmit}
              onDirtyChange={setDirty}
              onRequestNewClient={openNewClient}
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

      <Toast message={toastMessage ?? ""} visible={Boolean(toastMessage)} />
    </>
  );
}

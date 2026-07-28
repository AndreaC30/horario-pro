import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { ClientForm } from "../components/domain/ClientForm";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useClients } from "../hooks/useClients";
import { TYPE_BODY, TYPE_DISPLAY, TYPE_EYEBROW } from "../lib/typography";

type LocationState = {
  from?: string;
};

export function ClientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const { clients, loading, error, refresh, add, update } = useClients();

  const from = (location.state as LocationState | null)?.from ?? "/clientes";
  const editing = useMemo(
    () => (isEdit ? clients.find((client) => client.id === Number(id)) : undefined),
    [clients, id, isEdit],
  );

  const goBack = (extra?: { preferredClientId?: number }) => {
    navigate(from, {
      replace: true,
      state: extra?.preferredClientId
        ? { preferredClientId: extra.preferredClientId }
        : undefined,
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={() => void refresh()} />;
  }

  if (isEdit && !editing) {
    return (
      <div className="space-y-3">
        <ErrorBanner message="No se encontró ese cliente." />
        <Button type="button" variant="secondary" className="w-full" onClick={() => navigate("/clientes", { replace: true })}>
          Volver a clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <p className={TYPE_EYEBROW}>Agenda</p>
        <h2 className={`${TYPE_DISPLAY} mt-0.5`}>
          {isEdit ? "Editar cliente" : "Nuevo cliente"}
        </h2>
        <p className={`${TYPE_BODY} mt-1`}>
          {isEdit
            ? "Actualiza nombre, color o tarifa."
            : "Nombre y color. La tarifa es opcional."}
        </p>
      </div>

      <div className="border-t border-border/70 pt-4">
        <ClientForm
          initial={editing}
          onCancel={() => goBack()}
          onSubmit={async (data) => {
            if (isEdit && editing) {
              await update(editing.id, data);
              goBack();
              return;
            }
            const created = await add(data);
            goBack({ preferredClientId: created.id });
          }}
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ShiftQuickForm } from "../components/domain/ShiftQuickForm";
import { Card } from "../components/ui/Card";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useClients } from "../hooks/useClients";
import { createShift, getShift, updateShift } from "../services/shiftService";
import type { ShiftInput } from "../types/api";

export function ShiftFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { clients, loading: clientsLoading, error: clientsError } = useClients();
  const [initial, setInitial] = useState<Partial<ShiftInput> | undefined>(undefined);
  const [loadingShift, setLoadingShift] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

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
    } else {
      await createShift(data);
    }
    navigate("/dashboard", { replace: true });
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
    <Card title={isEdit ? "Editar jornada" : "Nueva jornada"}>
      <ShiftQuickForm clients={clients} initial={initial} onSubmit={handleSubmit} />
    </Card>
  );
}

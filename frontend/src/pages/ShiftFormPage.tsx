import { useParams } from "react-router-dom";

import { Card } from "../components/ui/Card";

export function ShiftFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  return (
    <Card title={isEdit ? "Editar jornada" : "Nueva jornada"}>
      <p className="text-sm text-slate-600">Formulario rápido — fase 4.</p>
    </Card>
  );
}

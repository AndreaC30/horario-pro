import { Link } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { apiRequest } from "../services/apiClient";
import { useEffect, useState } from "react";

type HealthResponse = { status: string; database: string };

export function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<HealthResponse>("/health", { skipAuth: true })
      .then(setHealth)
      .catch((err: Error) => setHealthError(err.message));
  }, []);

  return (
    <div className="space-y-4">
      <Card title="Estado API (fase 0)">
        {health ? (
          <p className="text-sm text-green-700">
            API {health.status} — BD {health.database}
          </p>
        ) : healthError ? (
          <p className="text-sm text-red-600">{healthError}</p>
        ) : (
          <p className="text-sm text-slate-500">Comprobando…</p>
        )}
      </Card>
      <Card title="Resumen">
        <p className="text-sm text-slate-600">KPIs y últimas jornadas — fase 3.</p>
      </Card>
      <Link to="/jornada/nueva" className="block">
        <Button className="w-full">+ Nueva jornada</Button>
      </Link>
    </div>
  );
}

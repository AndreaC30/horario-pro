import { useCallback, useEffect, useState } from "react";

import { listShifts } from "../services/shiftService";
import type { Shift } from "../types/api";

type UseShiftsParams = {
  from?: string;
  to?: string;
  clientId?: number;
  limit?: number;
};

export function useShifts(params: UseShiftsParams = {}) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setShifts(
        await listShifts({
          from: params.from,
          to: params.to,
          client_id: params.clientId,
          limit: params.limit ?? 100,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el historial");
    } finally {
      setLoading(false);
    }
  }, [params.from, params.to, params.clientId, params.limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { shifts, loading, error, refresh };
}

import { useCallback, useEffect, useState } from "react";

import { getDashboardSummary } from "../services/shiftService";
import type { DashboardSummary } from "../types/api";

export function useDashboard(recentLimit = 5, year?: number, month?: number) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getDashboardSummary(recentLimit, year, month);
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, [recentLimit, year, month]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

import { useCallback, useEffect, useState } from "react";

import { createClient, deleteClient, listClients, updateClient } from "../services/clientService";
import type { Client, ClientInput } from "../types/api";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setClients(await listClients());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (input: ClientInput) => {
      const created = await createClient(input);
      await refresh();
      return created;
    },
    [refresh],
  );

  const update = useCallback(
    async (id: number, input: Partial<ClientInput>) => {
      const updated = await updateClient(id, input);
      await refresh();
      return updated;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteClient(id);
      await refresh();
    },
    [refresh],
  );

  return { clients, loading, error, refresh, add, update, remove };
}

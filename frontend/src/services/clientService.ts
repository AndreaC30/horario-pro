import type { Client, ClientInput } from "../types/api";
import { apiRequest } from "./apiClient";

export function listClients() {
  return apiRequest<Client[]>("/api/v1/clients");
}

export function createClient(data: ClientInput) {
  return apiRequest<Client>("/api/v1/clients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateClient(id: number, data: Partial<ClientInput>) {
  return apiRequest<Client>(`/api/v1/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteClient(id: number) {
  return apiRequest<void>(`/api/v1/clients/${id}`, { method: "DELETE" });
}

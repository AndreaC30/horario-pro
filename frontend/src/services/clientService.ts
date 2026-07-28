import type { Client, ClientInput } from "../types/api";
import { apiRequest } from "./apiClient";

export function listClients(includeArchived = false) {
  const q = includeArchived ? "?include_archived=true" : "";
  return apiRequest<Client[]>(`/api/v1/clients${q}`);
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

export function archiveClient(id: number) {
  return apiRequest<Client>(`/api/v1/clients/${id}/archive`, { method: "POST" });
}

export function unarchiveClient(id: number) {
  return apiRequest<Client>(`/api/v1/clients/${id}/unarchive`, { method: "POST" });
}

export function deleteClient(id: number) {
  return apiRequest<void>(`/api/v1/clients/${id}`, { method: "DELETE" });
}

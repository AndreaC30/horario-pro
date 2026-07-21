import type { DashboardSummary, Shift, ShiftInput } from "../types/api";
import { apiRequest } from "./apiClient";

export function getDashboardSummary(recentLimit = 5, year?: number, month?: number) {
  const params = new URLSearchParams();
  params.set("recent_limit", String(recentLimit));
  if (year !== undefined) params.set("year", String(year));
  if (month !== undefined) params.set("month", String(month));
  return apiRequest<DashboardSummary>(`/api/v1/dashboard/summary?${params.toString()}`);
}

export function listShifts(params?: { from?: string; to?: string; client_id?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.client_id) search.set("client_id", String(params.client_id));
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  return apiRequest<Shift[]>(`/api/v1/shifts${query ? `?${query}` : ""}`);
}

export function getShift(id: number) {
  return apiRequest<Shift>(`/api/v1/shifts/${id}`);
}

export function createShift(data: ShiftInput) {
  return apiRequest<Shift>("/api/v1/shifts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateShift(id: number, data: Partial<ShiftInput>) {
  return apiRequest<Shift>(`/api/v1/shifts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteShift(id: number) {
  return apiRequest<void>(`/api/v1/shifts/${id}`, { method: "DELETE" });
}

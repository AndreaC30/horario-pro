import type { ActiveTimer, TimerStopDraft } from "../types/api";
import { apiRequest } from "./apiClient";

export function getActiveTimer() {
  return apiRequest<ActiveTimer | null>("/api/v1/timer");
}

export function startTimer(client_id: number, notes?: string | null) {
  return apiRequest<ActiveTimer>("/api/v1/timer/start", {
    method: "POST",
    body: JSON.stringify({ client_id, notes: notes ?? null }),
  });
}

export function stopTimer() {
  return apiRequest<TimerStopDraft>("/api/v1/timer/stop", { method: "POST" });
}

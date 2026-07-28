export function formatHours(value: string | number): string {
  const hours = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(hours)) {
    return "0 h";
  }
  return `${hours.toLocaleString("es-ES", { maximumFractionDigits: 2 })} h`;
}

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

export function defaultShiftTimes(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(start.getHours() - 8);
  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
}

const LAST_CLIENT_KEY = "horariopro_last_client_id";

export function getLastClientId(): number | null {
  const raw = localStorage.getItem(LAST_CLIENT_KEY);
  return raw ? Number(raw) : null;
}

export function setLastClientId(clientId: number): void {
  localStorage.setItem(LAST_CLIENT_KEY, String(clientId));
}

export function setEndToNow(): string {
  return toDatetimeLocalValue(new Date().toISOString());
}

export function setStartHoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return toDatetimeLocalValue(date.toISOString());
}

/** Set a fixed duration ending now (hours). */
export function setDurationEndingNow(hours: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);
  start.setHours(start.getHours() - hours);
  return {
    start: toDatetimeLocalValue(start.toISOString()),
    end: toDatetimeLocalValue(end.toISOString()),
  };
}

/**
 * Replay last shift onto today: same clock times if possible,
 * otherwise same duration ending now.
 */
export function replayLastShiftOntoToday(
  lastStartIso: string,
  lastEndIso: string,
): { start: string; end: string } {
  const lastStart = new Date(lastStartIso);
  const lastEnd = new Date(lastEndIso);
  const durationMs = lastEnd.getTime() - lastStart.getTime();
  const today = new Date();
  const start = new Date(today);
  start.setHours(lastStart.getHours(), lastStart.getMinutes(), 0, 0);
  const end = new Date(start.getTime() + durationMs);
  if (end.getTime() <= start.getTime() || durationMs <= 0) {
    return setDurationEndingNow(Math.max(1, durationMs / 3_600_000));
  }
  return {
    start: toDatetimeLocalValue(start.toISOString()),
    end: toDatetimeLocalValue(end.toISOString()),
  };
}

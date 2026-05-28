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
  start.setHours(9, 0, 0, 0);
  const end = new Date(now);
  if (end <= start) {
    end.setHours(17, 0, 0, 0);
  }
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

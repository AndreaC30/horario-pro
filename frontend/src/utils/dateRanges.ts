export type DateRange = { from?: string; to?: string; label: string };

export function weekBounds(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function monthBounds(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function lastMonthBounds(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export const HISTORY_PRESETS: { id: string; label: string; getRange: () => { from?: string; to?: string } }[] = [
  { id: "month", label: "Este mes", getRange: monthBounds },
  { id: "last_month", label: "Mes pasado", getRange: lastMonthBounds },
  { id: "week", label: "Esta semana", getRange: weekBounds },
  { id: "all", label: "Todo", getRange: () => ({}) },
];

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

import { ShiftList } from "../components/domain/ShiftList";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useShifts } from "../hooks/useShifts";
import { TYPE_BODY, TYPE_DISPLAY, TYPE_EYEBROW } from "../lib/typography";
import type { Shift } from "../types/api";

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Monday = 0 … Sunday = 6 */
function firstWeekdayMonday(year: number, month: number): number {
  const js = new Date(year, month - 1, 1).getDay();
  return js === 0 ? 6 : js - 1;
}

function dayKey(year: number, month: number, day: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

function isCurrentOrFutureMonth(year: number, month: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

function isFutureDay(year: number, month: number, day: number): boolean {
  const now = new Date();
  const cell = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return cell.getTime() > today.getTime();
}

export function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const isCurrentMonth = isCurrentOrFutureMonth(year, month);

  const bounds = useMemo(() => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { from: start.toISOString(), to: end.toISOString() };
  }, [year, month]);

  const { shifts, loading, error, refresh } = useShifts({ ...bounds, limit: 100 });

  const byDay = useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const shift of shifts) {
      const d = new Date(shift.start_time);
      const key = dayKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
      const list = map.get(key) ?? [];
      list.push(shift);
      map.set(key, list);
    }
    return map;
  }, [shifts]);

  const goPrev = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(null);
  };

  const goNext = () => {
    if (isCurrentMonth) return;
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(null);
  };

  const totalDays = daysInMonth(year, month);
  const offset = firstWeekdayMonday(year, month);
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedKey = selectedDay ? dayKey(year, month, selectedDay) : null;
  const selectedShifts = selectedKey ? (byDay.get(selectedKey) ?? []) : [];

  const weekdays = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="space-y-8 pb-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className={TYPE_EYEBROW}>Vista</p>
            <h2 className={`${TYPE_DISPLAY} mt-0.5 capitalize`}>{monthLabel(year, month)}</h2>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={goPrev}
              className="min-h-touch min-w-touch rounded-lg p-2 text-text-secondary transition hover:bg-[var(--bg-soft)] hover:text-text-primary"
              aria-label="Mes anterior"
            >
              <PiCaretLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={isCurrentMonth}
              className={`min-h-touch min-w-touch rounded-lg p-2 transition ${
                isCurrentMonth
                  ? "cursor-default text-text-muted"
                  : "text-text-secondary hover:bg-[var(--bg-soft)] hover:text-text-primary"
              }`}
              aria-label="Mes siguiente"
            >
              <PiCaretRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : null}
        {error ? <ErrorBanner message={error} onRetry={() => void refresh()} /> : null}

        {!loading && !error ? (
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-1.5 px-0.5 text-center font-mono text-[0.65rem] tracking-wide text-text-muted">
              {weekdays.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`e-${idx}`} className="aspect-square" aria-hidden />;
                }

                const key = dayKey(year, month, day);
                const dayShifts = byDay.get(key) ?? [];
                const selected = selectedDay === day;
                const isToday =
                  year === now.getFullYear() &&
                  month === now.getMonth() + 1 &&
                  day === now.getDate();
                const future = isFutureDay(year, month, day);
                const hasWork = dayShifts.length > 0;
                const accent = dayShifts[0]?.client.color;

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={future}
                    onClick={() => setSelectedDay(day)}
                    className={`relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl text-sm transition ${
                      future
                        ? "cursor-default text-text-muted/45"
                        : selected
                          ? "bg-primary/15 text-text-primary ring-1 ring-primary/40"
                          : hasWork
                            ? "bg-[var(--bg-soft)] text-text-primary hover:bg-[var(--bg-surface-elevated)]"
                            : "text-text-secondary hover:bg-[var(--bg-soft)]"
                    }`}
                    aria-label={`Día ${day}${dayShifts.length ? `, ${dayShifts.length} jornadas` : ""}${future ? ", futuro" : ""}`}
                    aria-pressed={selected}
                  >
                    {hasWork && !future && accent ? (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                        style={{ backgroundColor: accent }}
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm tabular-nums ${
                        isToday
                          ? "bg-primary font-semibold text-white"
                          : selected
                            ? "font-semibold"
                            : "font-medium"
                      }`}
                    >
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {selectedDay ? (
        <section className="space-y-3 border-t border-border/70 pt-5">
          <div>
            <p className={TYPE_EYEBROW}>Detalle</p>
            <h3 className={`${TYPE_DISPLAY} mt-0.5`}>
              {selectedDay} · {monthLabel(year, month)}
            </h3>
          </div>
          <ShiftList
            shifts={selectedShifts}
            emptyTitle="Sin jornadas"
            emptyDescription="No hay jornadas este día."
            emptyAction={
              <Link to="/jornada/nueva" state={{ from: "/calendario" }}>
                <Button className="w-full">+ Nueva jornada</Button>
              </Link>
            }
            embedded
          />
        </section>
      ) : (
        <p className={TYPE_BODY}>Toca un día para ver sus jornadas.</p>
      )}
    </div>
  );
}

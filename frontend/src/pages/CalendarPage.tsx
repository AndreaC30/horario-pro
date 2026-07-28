import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

import { ShiftList } from "../components/domain/ShiftList";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useShifts } from "../hooks/useShifts";
import { TYPE_DISPLAY, TYPE_EYEBROW } from "../lib/typography";
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

export function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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
    <div className="space-y-6 pb-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className={TYPE_EYEBROW}>Vista</p>
            <h2 className={`${TYPE_DISPLAY} mt-0.5 capitalize`}>{monthLabel(year, month)}</h2>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={goPrev}
              className="min-h-touch min-w-touch rounded-lg p-2 text-text-secondary transition hover:bg-[var(--bg-soft)]"
              aria-label="Mes anterior"
            >
              <PiCaretLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="min-h-touch min-w-touch rounded-lg p-2 text-text-secondary transition hover:bg-[var(--bg-soft)]"
              aria-label="Mes siguiente"
            >
              <PiCaretRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : null}
        {error ? <ErrorBanner message={error} onRetry={() => void refresh()} /> : null}

        {!loading && !error ? (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[0.65rem] text-text-muted">
              {weekdays.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`e-${idx}`} className="aspect-square" />;
                }
                const key = dayKey(year, month, day);
                const dayShifts = byDay.get(key) ?? [];
                const colors = [...new Set(dayShifts.map((s) => s.client.color))].slice(0, 3);
                const selected = selectedDay === day;
                const isToday =
                  year === now.getFullYear() &&
                  month === now.getMonth() + 1 &&
                  day === now.getDate();
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`flex aspect-square flex-col items-center justify-start rounded-lg p-1 text-sm transition ${
                      selected
                        ? "bg-primary/15 ring-1 ring-primary"
                        : "hover:bg-[var(--bg-soft)]"
                    } ${isToday ? "font-semibold text-primary" : "text-text-primary"}`}
                    aria-label={`Día ${day}${dayShifts.length ? `, ${dayShifts.length} jornadas` : ""}`}
                    aria-pressed={selected}
                  >
                    <span>{day}</span>
                    {colors.length > 0 ? (
                      <span className="mt-auto flex gap-0.5 pb-0.5">
                        {colors.map((c) => (
                          <span
                            key={c}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: c }}
                            aria-hidden
                          />
                        ))}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {selectedDay ? (
        <section className="space-y-3">
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
        <p className="text-sm text-text-secondary">Toca un día para ver sus jornadas.</p>
      )}
    </div>
  );
}

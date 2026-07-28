import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../ui/Button";
import { listShifts } from "../../services/shiftService";

const STORAGE_KEY = "workshift_today_reminder_date";

function todayLocalKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Soft reminder after 18:00 if there is no shift today (once per local day).
 */
export function TodayReminderBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 18) return;

    const key = todayLocalKey();
    if (localStorage.getItem(STORAGE_KEY) === key) return;

    let cancelled = false;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    void listShifts({ from: start.toISOString(), to: end.toISOString(), limit: 1 })
      .then((shifts) => {
        if (cancelled) return;
        if (shifts.length === 0) {
          setVisible(true);
        }
      })
      .catch(() => {
        /* ignore */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, todayLocalKey());
    setVisible(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-[var(--bg-soft)] px-3 py-2.5">
      <p className="text-sm text-text-primary">¿Registraste hoy?</p>
      <div className="flex gap-2">
        <Link to="/jornada/nueva" state={{ from: "/dashboard" }} onClick={dismiss}>
          <Button type="button" className="min-h-10">
            Registrar
          </Button>
        </Link>
        <Button type="button" variant="ghost" className="min-h-10" onClick={dismiss}>
          Más tarde
        </Button>
      </div>
    </div>
  );
}

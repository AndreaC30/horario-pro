import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/Button";
import { useClients } from "../../hooks/useClients";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import type { ActiveTimer, Client } from "../../types/api";
import { OFFLINE_MESSAGE } from "../../utils/network";
import { getActiveTimer, startTimer, stopTimer } from "../../services/timerService";

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

type ActiveTimerBannerProps = {
  /** Compact bar for dashboard / shell */
  compact?: boolean;
};

export function ActiveTimerBanner({ compact = false }: ActiveTimerBannerProps) {
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const { clients } = useClients();
  const [timer, setTimer] = useState<ActiveTimer | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [clientId, setClientId] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStart, setShowStart] = useState(false);

  const refresh = async () => {
    try {
      const active = await getActiveTimer();
      setTimer(active);
      if (active) {
        setElapsed(active.elapsed_seconds);
      }
    } catch {
      /* ignore boot errors */
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!timer) return;
    const started = new Date(timer.started_at).getTime();
    const tick = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (clientId === "" && clients[0]) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  const handleStart = async (event: FormEvent) => {
    event.preventDefault();
    if (!clientId) return;
    setBusy(true);
    setError(null);
    try {
      const started = await startTimer(clientId);
      setTimer(started);
      setElapsed(started.elapsed_seconds);
      setShowStart(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar");
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    setBusy(true);
    setError(null);
    try {
      const draft = await stopTimer();
      setTimer(null);
      navigate("/jornada/nueva", {
        state: {
          from: "/dashboard",
          keepShiftTimes: true,
          duplicateFrom: {
            client_id: draft.client_id,
            start_time: draft.start_time,
            end_time: draft.end_time,
            break_minutes: draft.break_minutes,
            driving_extra: draft.driving_extra,
            notes: draft.notes,
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo parar");
    } finally {
      setBusy(false);
    }
  };

  if (timer) {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 ${
          compact ? "text-sm" : ""
        }`}
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-text-primary">
            Cronómetro · {timer.client.name}
          </p>
          <p className="font-mono tabular-nums text-text-secondary">{formatElapsed(elapsed)}</p>
        </div>
        <Button type="button" loading={busy} disabled={!online} onClick={() => void handleStop()}>
          Parar
        </Button>
        {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
      </div>
    );
  }

  if (!showStart) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={() => setShowStart(true)}>
          Iniciar cronómetro
        </Button>
        {!online ? <span className="text-xs text-warning">{OFFLINE_MESSAGE}</span> : null}
      </div>
    );
  }

  return (
    <form
      className="space-y-2 rounded-xl border border-border bg-[var(--bg-soft)] p-3"
      onSubmit={(e) => void handleStart(e)}
    >
      <p className="text-sm font-medium text-text-primary">¿Para qué cliente?</p>
      {clients.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Primero{" "}
          <Link to="/clientes/nuevo" className="text-primary no-underline">
            crea un cliente
          </Link>
          .
        </p>
      ) : (
        <select
          className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          value={clientId}
          onChange={(e) => setClientId(Number(e.target.value))}
        >
          {clients.map((c: Client) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" loading={busy} disabled={!online || clients.length === 0}>
          Empezar
        </Button>
        <Button type="button" variant="ghost" onClick={() => setShowStart(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

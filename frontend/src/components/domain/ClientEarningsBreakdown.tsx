import { useState } from "react";

import type { ClientPeriodSummary } from "../../types/api";
import { formatEstimatedPay, formatMoney } from "../../utils/money";
import { formatHours } from "../../utils/time";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";

type PeriodKey = "week" | "month";

type ClientEarningsBreakdownProps = {
  week: ClientPeriodSummary[];
  month: ClientPeriodSummary[];
  /** Evita repetir el total del mes (ya está en la sección ESTE MES). */
  hideMonthTotal?: boolean;
};

const PERIOD_LABELS: Record<PeriodKey, string> = {
  week: "Esta semana",
  month: "Este mes",
};

export function ClientEarningsBreakdown({
  week,
  month,
  hideMonthTotal = false,
}: ClientEarningsBreakdownProps) {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const rows = (period === "week" ? week : month) ?? [];

  const totalMoney = rows.reduce((sum, row) => sum + Number(row.estimated_money), 0);
  const totalHours = rows.reduce((sum, row) => sum + Number(row.hours), 0);
  const showTotal = period === "week" || !hideMonthTotal;

  return (
    <Card className="scroll-mt-4 h-full" id="por-cliente">
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`min-h-touch rounded-lg border px-3 text-sm font-medium transition ${
              period === key
                ? "border-primary bg-primary text-primary-foreground shadow-card"
                : "border-border bg-[var(--bg-soft)] text-text-secondary hover:border-[var(--border-hover)] hover:text-text-primary"
            }`}
            onClick={() => setPeriod(key)}
          >
            {PERIOD_LABELS[key]}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Sin jornadas en este periodo"
          description="Registra horas para ver el desglose por cliente."
        />
      ) : (
        <>
          {showTotal ? (
            <p className="mb-3 text-sm text-text-secondary">
              Total {PERIOD_LABELS[period].toLowerCase()}:{" "}
              <span className="font-display font-semibold tabular-nums text-text-primary">
                {formatHours(totalHours)}
              </span>
              {" · "}
              <span className="font-display font-semibold tabular-nums text-text-primary">
                {formatMoneyTotal(totalMoney)}
              </span>
            </p>
          ) : null}
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.client_id}
                className="flex min-h-touch items-center gap-3 rounded-lg border border-border bg-[var(--bg-soft)] px-3 py-3"
              >
                <span
                  className="h-10 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: row.client_color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">{row.client_name}</p>
                  <p className="font-mono text-xs text-text-secondary">
                    {formatHours(row.hours)}
                    {row.shift_count > 1 ? ` · ${row.shift_count} jornadas` : " · 1 jornada"}
                    {Number(row.driving_extras) > 0
                      ? ` · +${formatMoney(row.driving_extras)} conducción`
                      : ""}
                  </p>
                </div>
                <p className="font-display text-sm font-semibold tabular-nums text-text-primary">
                  {formatEstimatedPay(row.estimated_money, row.hourly_rate)}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function formatMoneyTotal(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

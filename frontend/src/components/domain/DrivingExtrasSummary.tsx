import { TYPE_EYEBROW } from "../../lib/typography";
import { Card } from "../ui/Card";
import { MoneyDisplay } from "./MoneyDisplay";

type DrivingExtrasSummaryProps = {
  today: string;
  week: string;
  month: string;
};

export function DrivingExtrasSummary({ today, week, month }: DrivingExtrasSummaryProps) {
  return (
    <Card title="Extras conducción">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border bg-[var(--bg-soft)] px-2 py-3">
          <p className={TYPE_EYEBROW}>Hoy</p>
          <p className="mt-1 font-display text-sm font-semibold tabular-nums text-text-primary">
            <MoneyDisplay value={today} />
          </p>
        </div>
        <div className="rounded-lg border border-border bg-[var(--bg-soft)] px-2 py-3">
          <p className={TYPE_EYEBROW}>Semana</p>
          <p className="mt-1 font-display text-sm font-semibold tabular-nums text-text-primary">
            <MoneyDisplay value={week} />
          </p>
        </div>
        <div className="rounded-lg border border-border bg-[var(--bg-soft)] px-2 py-3">
          <p className={TYPE_EYEBROW}>Mes</p>
          <p className="mt-1 font-display text-sm font-semibold tabular-nums text-text-primary">
            <MoneyDisplay value={month} />
          </p>
        </div>
      </div>
    </Card>
  );
}

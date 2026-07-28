import { TYPE_CARD_TITLE, TYPE_EYEBROW } from "../../lib/typography";
import { MoneyDisplay } from "./MoneyDisplay";

type DrivingExtrasSummaryProps = {
  today: string;
  week: string;
  month: string;
};

export function DrivingExtrasSummary({ today, week, month }: DrivingExtrasSummaryProps) {
  const cells = [
    { label: "Hoy", value: today },
    { label: "Semana", value: week },
    { label: "Mes", value: month },
  ] as const;

  return (
    <div>
      <h3 className={TYPE_CARD_TITLE}>Extras conducción</h3>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--bg-soft)] p-1">
        {cells.map((cell) => (
          <div key={cell.label} className="rounded-lg px-2 py-3 text-center">
            <p className={TYPE_EYEBROW}>{cell.label}</p>
            <p className="mt-1 font-display text-sm font-semibold tabular-nums text-text-primary">
              <MoneyDisplay value={cell.value} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

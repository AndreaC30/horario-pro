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
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="text-xs text-slate-500">Hoy</p>
          <p className="font-semibold">
            <MoneyDisplay value={today} />
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Semana</p>
          <p className="font-semibold">
            <MoneyDisplay value={week} />
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Mes</p>
          <p className="font-semibold">
            <MoneyDisplay value={month} />
          </p>
        </div>
      </div>
    </Card>
  );
}

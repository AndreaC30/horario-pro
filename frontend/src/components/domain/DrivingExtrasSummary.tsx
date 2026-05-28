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
          <p className="text-xs text-text-secondary">Hoy</p>
          <p className="font-semibold text-text-primary">
            <MoneyDisplay value={today} />
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Semana</p>
          <p className="font-semibold text-text-primary">
            <MoneyDisplay value={week} />
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Mes</p>
          <p className="font-semibold text-text-primary">
            <MoneyDisplay value={month} />
          </p>
        </div>
      </div>
    </Card>
  );
}

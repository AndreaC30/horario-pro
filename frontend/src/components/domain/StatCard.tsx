import { Card } from "../ui/Card";

type StatCardProps = {
  label: string;
  value: string;
  subvalue?: string;
};

export function StatCard({ label, value, subvalue }: StatCardProps) {
  return (
    <Card className="!p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      {subvalue ? <p className="text-xs text-slate-500">{subvalue}</p> : null}
    </Card>
  );
}

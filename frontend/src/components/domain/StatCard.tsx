import { Card } from "../ui/Card";

type StatCardProps = {
  label: string;
  value: string;
  subvalue?: string;
};

export function StatCard({ label, value, subvalue }: StatCardProps) {
  return (
    <Card className="!p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-text-primary">{value}</p>
      {subvalue ? <p className="text-xs text-text-secondary">{subvalue}</p> : null}
    </Card>
  );
}

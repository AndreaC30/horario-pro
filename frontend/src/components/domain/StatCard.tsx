type StatCardProps = {
  label: string;
  value: string;
  subvalue?: string;
  className?: string;
};

export function StatCard({ label, value, subvalue, className = "" }: StatCardProps) {
  return (
    <div className={`stat-card ${className}`.trim()}>
      <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
      <p className="text-xl font-bold tabular-nums text-text-primary">{value}</p>
      {subvalue ? <p className="mt-0.5 text-sm tabular-nums text-text-secondary">{subvalue}</p> : null}
    </div>
  );
}

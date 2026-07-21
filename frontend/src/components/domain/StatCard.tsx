import { useMagnetic } from "../../hooks/useMagnetic";
import { AnimatedCounter } from "./AnimatedCounter";

type StatCardProps = {
  label: string;
  value: number;
  suffix?: string;
  subvalue?: number;
  subSuffix?: string;
  className?: string;
  magnetic?: boolean;
};

export function StatCard({ label, value, suffix = "h", subvalue, subSuffix = "€", className = "", magnetic = false }: StatCardProps) {
  const id = `stat-${label.replace(/\s+/g, "-").toLowerCase()}`;
  if (magnetic) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMagnetic(`#${id}`, 0.06);
  }

  return (
    <div
      id={id}
      className={`stat-card group cursor-default ${className}`.trim()}
    >
      <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-widest text-text-muted group-hover:text-primary/70 transition-colors duration-200">
        {label}
      </p>
      <p className="text-xl font-bold tabular-nums text-text-primary">
        <AnimatedCounter value={Math.round(value * 10) / 10} suffix={suffix} />
      </p>
      {subvalue !== undefined ? (
        <p className="mt-0.5 text-sm tabular-nums text-text-secondary">
          <AnimatedCounter value={Math.round(subvalue * 100) / 100} suffix={subSuffix} />
        </p>
      ) : null}
    </div>
  );
}

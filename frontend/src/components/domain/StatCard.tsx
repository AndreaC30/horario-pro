import { useMagnetic } from "../../hooks/useMagnetic";
import { TYPE_EYEBROW } from "../../lib/typography";
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
      <p className={`${TYPE_EYEBROW} mb-1 group-hover:text-primary/70 transition-colors duration-200`}>
        {label}
      </p>
      <p className="font-display text-xl font-semibold tabular-nums tracking-tight text-text-primary">
        <AnimatedCounter value={Math.round(value * 10) / 10} suffix={suffix} />
      </p>
      {subvalue !== undefined ? (
        <p className="mt-0.5 font-mono text-sm tabular-nums text-text-secondary">
          <AnimatedCounter value={Math.round(subvalue * 100) / 100} suffix={subSuffix} />
        </p>
      ) : null}
    </div>
  );
}

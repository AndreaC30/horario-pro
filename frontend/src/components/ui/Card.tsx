import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-surface-card p-4 shadow-sm ${className}`}>
      {title ? <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2> : null}
      {children}
    </section>
  );
}

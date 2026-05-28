import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section className={`glass-card ${className}`}>
      {title ? (
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

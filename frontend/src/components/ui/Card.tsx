import type { ReactNode } from "react";

type CardProps = {
  id?: string;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ id, title, children, className = "" }: CardProps) {
  return (
    <section id={id} className={`glass-card ${className}`}>
      {title ? (
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

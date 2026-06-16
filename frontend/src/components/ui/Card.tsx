import type { HTMLAttributes } from "react";
import { ShineBorder } from "../effects/ShineBorder";

type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  elevated?: boolean;
};

export function Card({ title, children, className = "", elevated = false, ...props }: CardProps) {
  return (
    <ShineBorder speed="slow">
      <section className={`${elevated ? "card-elevated" : "card"} ${className}`.trim()} {...props}>
        {title ? (
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
        ) : null}
        {children}
      </section>
    </ShineBorder>
  );
}

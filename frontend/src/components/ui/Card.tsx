import type { HTMLAttributes } from "react";
import { ShineBorder } from "../effects/ShineBorder";

type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  elevated?: boolean;
  /** Si true, aplica ShineBorder + borde azul. Usar como mucho 1 por vista. */
  accent?: boolean;
};

export function Card({ title, children, className = "", elevated = false, accent = false, ...props }: CardProps) {
  const variantClass = accent ? "card-accent" : elevated ? "card-elevated" : "card";

  const content = (
    <section className={`${variantClass} ${className}`.trim()} {...props}>
      {title ? (
        <h2 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
      ) : null}
      {children}
    </section>
  );

  if (accent) {
    return <ShineBorder speed="slow">{content}</ShineBorder>;
  }

  return content;
}

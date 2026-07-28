import type { HTMLAttributes } from "react";
import { TYPE_CARD_TITLE } from "../../lib/typography";

type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  elevated?: boolean;
  /** Borde/acento azul WorkShift (sin efectos de brillo). */
  accent?: boolean;
};

export function Card({
  title,
  children,
  className = "",
  elevated = false,
  accent = false,
  ...props
}: CardProps) {
  const variantClass = accent ? "card-accent" : elevated ? "card-elevated" : "card";

  return (
    <section className={`${variantClass} ${className}`.trim()} {...props}>
      {title ? <h2 className={TYPE_CARD_TITLE}>{title}</h2> : null}
      {children}
    </section>
  );
}

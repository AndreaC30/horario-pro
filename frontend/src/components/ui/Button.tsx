import { motion } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary:
    "border border-border bg-white/[0.04] text-text-primary hover:border-white/10 hover:bg-white/[0.06]",
  ghost: "bg-transparent text-text-secondary hover:bg-white/[0.06] hover:text-text-primary",
  danger: "bg-danger/90 text-white hover:bg-danger",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", duration: 0.2, bounce: 0 }}
      className={`inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl px-[18px] py-3.5 text-sm font-semibold transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? "Cargando..." : children}
    </motion.button>
  );
}

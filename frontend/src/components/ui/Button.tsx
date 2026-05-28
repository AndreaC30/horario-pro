import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-glass hover:bg-primary-hover hover:-translate-y-px active:translate-y-0",
  secondary:
    "border border-border bg-white/[0.04] text-text-primary hover:border-white/20 hover:bg-white/[0.06]",
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
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex min-h-touch min-w-touch items-center justify-center rounded-[14px] px-[18px] py-3.5 text-sm font-semibold transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? "Cargando…" : children}
    </button>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "danger" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  danger:
    "min-h-touch rounded-xl bg-danger/10 border border-danger/30 px-4 py-2.5 text-sm font-semibold text-danger transition-all duration-200 hover:bg-danger/20 active:scale-[0.97]",
  secondary:
    "min-h-touch rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-elevated active:scale-[0.97]",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = variants[variant];

  return (
    <button
      className={`${base} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

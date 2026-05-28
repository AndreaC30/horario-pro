import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className = "", error, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        id={id}
        className={`min-h-touch w-full rounded-xl border px-3 py-2 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? "border-red-500" : "border-slate-300"
        } ${className}`}
        {...props}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

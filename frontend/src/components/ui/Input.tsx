import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className = "", error, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        id={id}
        className={`glass-input ${error ? "border-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)]" : ""} ${className}`}
        {...props}
      />
      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
    </div>
  );
}

import { useState, type ReactNode } from "react";

type CollapsibleProps = {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

/** Progressive disclosure (UX §7) */
export function Collapsible({ label, children, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80">
      <button
        type="button"
        className="flex min-h-touch w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-700"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {label}
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="space-y-3 border-t border-slate-200 px-3 py-3">{children}</div> : null}
    </div>
  );
}

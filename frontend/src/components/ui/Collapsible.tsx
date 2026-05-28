import { useState, type ReactNode } from "react";
import { IoAdd, IoRemove } from "react-icons/io5";

type CollapsibleProps = {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function Collapsible({ label, children, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-white/[0.02]">
      <button
        type="button"
        className="flex min-h-touch w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-text-primary"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {label}
        <span className="text-text-secondary" aria-hidden>
          {open ? <IoRemove className="h-5 w-5" /> : <IoAdd className="h-5 w-5" />}
        </span>
      </button>
      {open ? <div className="space-y-3 border-t border-border px-3 py-3">{children}</div> : null}
    </div>
  );
}

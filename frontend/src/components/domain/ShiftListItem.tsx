import { Link } from "react-router-dom";

import type { Shift } from "../../types/api";
import { formatMoney } from "../../utils/money";
import { formatHours } from "../../utils/time";

type ShiftListItemProps = {
  shift: Shift;
};

export function ShiftListItem({ shift }: ShiftListItemProps) {
  const date = new Date(shift.start_time).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Link
      to={`/jornada/${shift.id}`}
      className="flex min-h-touch items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition hover:border-primary/40"
    >
      <span
        className="h-10 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: shift.client.color }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{shift.client.name}</p>
        <p className="text-xs text-slate-500">
          {date} · {formatHours(shift.worked_hours)}
        </p>
      </div>
      <p className="text-sm font-semibold text-slate-800">{formatMoney(shift.estimated_pay)}</p>
    </Link>
  );
}

import { Link } from "react-router-dom";

import type { Shift } from "../../types/api";
import { formatEstimatedPay, formatMoney } from "../../utils/money";
import { formatHours } from "../../utils/time";

type ShiftListItemProps = {
  shift: Shift;
  showDelete?: boolean;
  onDelete?: (shift: Shift) => void;
};

export function ShiftListItem({ shift, showDelete, onDelete }: ShiftListItemProps) {
  const date = new Date(shift.start_time).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const driving = Number(shift.driving_extra);
  const drivingLabel = driving > 0 ? ` · +${formatMoney(driving)} conducción` : "";

  return (
    <div className="flex items-stretch gap-1">
      <Link
        to={`/jornada/${shift.id}`}
        className="flex min-h-touch flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition hover:border-primary/40"
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
            {drivingLabel}
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-800">
          {formatEstimatedPay(shift.estimated_pay, shift.client.hourly_rate)}
        </p>
      </Link>
      {showDelete && onDelete ? (
        <button
          type="button"
          className="min-h-touch min-w-[2.75rem] rounded-xl border border-slate-200 bg-white px-2 text-sm text-red-600"
          aria-label={`Eliminar jornada de ${shift.client.name}`}
          onClick={() => onDelete(shift)}
        >
          Eliminar
        </button>
      ) : null}
    </div>
  );
}

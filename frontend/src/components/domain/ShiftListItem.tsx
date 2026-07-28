import { Link, useLocation } from "react-router-dom";

import type { Shift } from "../../types/api";
import { formatEstimatedPay, formatMoney } from "../../utils/money";
import { formatHours } from "../../utils/time";

type ShiftListItemProps = {
  shift: Shift;
  showDelete?: boolean;
  showDuplicate?: boolean;
  onDelete?: (shift: Shift) => void;
  /** When inside a Card, use dividers instead of full borders */
  embedded?: boolean;
};

export function ShiftListItem({
  shift,
  showDelete,
  showDuplicate,
  onDelete,
  embedded = false,
}: ShiftListItemProps) {
  const location = useLocation();
  const date = new Date(shift.start_time).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const driving = Number(shift.driving_extra);
  const drivingLabel = driving > 0 ? ` · +${formatMoney(driving)} conducción` : "";

  const duplicateState = {
    from: location.pathname,
    duplicateFrom: {
      client_id: shift.client_id,
      start_time: shift.start_time,
      end_time: shift.end_time,
      break_minutes: shift.break_minutes,
      driving_extra: Number(shift.driving_extra),
      notes: shift.notes,
    },
  };

  return (
    <div className="flex items-stretch gap-1">
      <Link
        to={`/jornada/${shift.id}`}
        state={{ from: location.pathname }}
        className={`flex min-h-[2.75rem] flex-1 items-center gap-3 rounded-xl px-2 py-2 transition-colors ${
          embedded ? "hover:bg-accent-muted/50" : "list-item"
        }`}
      >
        <span
          className="h-9 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: shift.client.color }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">{shift.client.name}</p>
          <p className="text-xs text-text-secondary">
            {date} · {formatHours(shift.worked_hours)}
            {drivingLabel}
          </p>
        </div>
        <p className="text-sm font-semibold tabular-nums text-text-primary">
          {formatEstimatedPay(shift.estimated_pay, shift.client.hourly_rate)}
        </p>
      </Link>
      {showDuplicate ? (
        <Link
          to="/jornada/nueva"
          state={duplicateState}
          className="flex min-h-touch min-w-[2.75rem] items-center justify-center rounded-lg px-2 text-sm font-medium text-text-secondary no-underline transition-colors hover:bg-[var(--bg-soft)] hover:text-text-primary"
          aria-label={`Duplicar jornada de ${shift.client.name}`}
        >
          Duplicar
        </Link>
      ) : null}
      {showDelete && onDelete ? (
        <button
          type="button"
          className="min-h-touch min-w-[2.75rem] rounded-lg px-2 text-sm text-danger transition-colors hover:bg-danger/10"
          aria-label={`Eliminar jornada de ${shift.client.name}`}
          onClick={() => onDelete(shift)}
        >
          Eliminar
        </button>
      ) : null}
    </div>
  );
}

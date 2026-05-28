import type { Shift } from "../../types/api";
import { EmptyState } from "../ui/EmptyState";
import { ShiftListItem } from "./ShiftListItem";

type ShiftListProps = {
  shifts: Shift[];
  emptyTitle?: string;
};

export function ShiftList({ shifts, emptyTitle = "Sin jornadas" }: ShiftListProps) {
  if (shifts.length === 0) {
    return <EmptyState title={emptyTitle} description="Registra tu primera jornada desde el botón de abajo." />;
  }

  return (
    <ul className="space-y-2">
      {shifts.map((shift) => (
        <li key={shift.id}>
          <ShiftListItem shift={shift} />
        </li>
      ))}
    </ul>
  );
}

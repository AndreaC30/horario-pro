import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import type { Shift } from "../../types/api";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ShiftListItem } from "./ShiftListItem";

type ShiftListProps = {
  shifts: Shift[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  showDelete?: boolean;
  onDelete?: (shift: Shift) => void;
};

export function ShiftList({
  shifts,
  emptyTitle = "Sin jornadas",
  emptyDescription = "Registra tu primera jornada.",
  emptyAction,
  showDelete = false,
  onDelete,
}: ShiftListProps) {
  if (shifts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={
          emptyAction ?? (
            <Link to="/jornada/nueva">
              <Button className="w-full">+ Nueva jornada</Button>
            </Link>
          )
        }
      />
    );
  }

  return (
    <ul className="space-y-2">
      {shifts.map((shift) => (
        <li key={shift.id}>
          <ShiftListItem shift={shift} showDelete={showDelete} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}

import { motion } from "motion/react";
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
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
    <motion.ul
      className="space-y-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {shifts.map((shift) => (
        <motion.li key={shift.id} variants={item}>
          <ShiftListItem shift={shift} showDelete={showDelete} onDelete={onDelete} />
        </motion.li>
      ))}
    </motion.ul>
  );
}

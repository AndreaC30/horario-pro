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
  /** Use separators instead of card-style borders (for use inside Card) */
  embedded?: boolean;
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
  embedded = false,
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
      className={embedded ? "divide-y divide-border" : "space-y-2"}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {shifts.map((shift) => (
        <motion.li
          key={shift.id}
          variants={item}
          className={embedded ? "py-1.5 first:pt-0 last:pb-0" : ""}
        >
          <ShiftListItem
            shift={shift}
            showDelete={showDelete}
            onDelete={onDelete}
            embedded={embedded}
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}

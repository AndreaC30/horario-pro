import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type ToastProps = {
  message: string;
  visible: boolean;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  actionNode?: ReactNode;
};

export function Toast({
  message,
  visible,
  actionLabel,
  actionTo,
  onAction,
  actionNode,
}: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-50 flex max-w-app -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary shadow-card backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <span className="min-w-0 flex-1">{message}</span>
          {actionNode}
          {actionLabel && actionTo ? (
            <Link
              to={actionTo}
              className="shrink-0 font-semibold text-primary no-underline hover:text-primary-hover"
            >
              {actionLabel}
            </Link>
          ) : null}
          {actionLabel && onAction && !actionTo ? (
            <button
              type="button"
              className="shrink-0 font-semibold text-primary hover:text-primary-hover"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

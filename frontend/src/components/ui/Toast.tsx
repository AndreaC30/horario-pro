import { AnimatePresence, motion } from "motion/react";

type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-50 max-w-app -translate-x-1/2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary shadow-card backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

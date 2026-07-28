import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback } from "react";

import { IoClose } from "react-icons/io5";

import { useEscapeToClose, useHistoryBackClose } from "../../hooks/useOverlayClose";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  const handleClose = useCallback(() => onClose(), [onClose]);
  useEscapeToClose(open, handleClose);
  useHistoryBackClose(open, handleClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--bg)]/70 p-4 backdrop-blur-sm sm:items-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            className="card-elevated w-full max-w-app !p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 id="modal-title" className="font-display text-lg font-semibold tracking-tight text-text-primary">
                {title}
              </h2>
              <Button type="button" variant="ghost" onClick={handleClose} aria-label="Cerrar">
                <IoClose className="h-5 w-5" aria-hidden />
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

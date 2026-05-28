import type { ReactNode } from "react";

import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="w-full max-w-app rounded-2xl bg-white p-4 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label="Cerrar">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

import { IoClose } from "react-icons/io5";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="glass-card w-full max-w-app !p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="modal-title" className="text-lg font-bold text-text-primary">
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label="Cerrar">
            <IoClose className="h-5 w-5" aria-hidden />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

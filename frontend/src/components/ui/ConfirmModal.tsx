import type { ReactNode } from "react";

import { Button } from "./Button";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "danger",
  loading = false,
  error = null,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  const handleBackdrop = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
      role="presentation"
    >
      <div
        className="card-elevated w-full max-w-[17rem] !p-4 sm:max-w-xs"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="text-base font-bold text-text-primary">
          {title}
        </h2>
        <div id="confirm-modal-desc" className="mt-2 text-sm text-text-secondary">
          {children}
        </div>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1 !px-3 !py-2.5 text-sm" type="button" disabled={loading} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            className="flex-1 !px-3 !py-2.5 text-sm"
            type="button"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";

/**
 * Escape cierra el overlay mientras esté abierto.
 * Si `enabled` es false (p. ej. loading), no hace nada.
 */
export function useEscapeToClose(open: boolean, onClose: () => void, enabled = true) {
  useEffect(() => {
    if (!open || !enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, enabled]);
}

/**
 * Al abrir un modal, apila una entrada en el historial para que
 * el botón atrás del sistema/navegador cierre el modal en lugar de salir de la página.
 */
export function useHistoryBackClose(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    let closedByPop = false;
    window.history.pushState({ __wsModal: true }, "");

    const onPopState = () => {
      closedByPop = true;
      onCloseRef.current();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (!closedByPop && window.history.state && (window.history.state as { __wsModal?: boolean }).__wsModal) {
        window.history.back();
      }
    };
  }, [open]);
}

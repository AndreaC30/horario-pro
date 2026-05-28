import { useEffect } from "react";

/** UX-J09: aviso al cerrar pestaña con cambios sin guardar */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

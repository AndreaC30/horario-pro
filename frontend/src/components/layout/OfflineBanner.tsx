import { useOnlineStatus } from "../../hooks/useOnlineStatus";

/** FE-063: aviso visible sin conexión */
export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) {
    return null;
  }

  return (
    <div
      className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
      role="status"
      aria-live="polite"
    >
      Sin conexión — puedes consultar lo cacheado; guardar cambios requiere red.
    </div>
  );
}

import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) {
    return null;
  }

  return (
    <div
      className="bg-warning/20 px-4 py-2 text-center text-sm font-medium text-warning"
      role="status"
      aria-live="polite"
    >
      Sin conexión — puedes consultar lo cacheado; guardar cambios requiere red.
    </div>
  );
}

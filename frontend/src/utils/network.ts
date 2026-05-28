export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export const OFFLINE_MESSAGE =
  "Sin conexión. Los cambios requieren red; vuelve a intentarlo cuando estés en línea.";

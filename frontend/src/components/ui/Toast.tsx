type ToastProps = {
  message: string;
  visible: boolean;
};

/** UX-G05: feedback visible tras acciones */
export function Toast({ message, visible }: ToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-50 max-w-app -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

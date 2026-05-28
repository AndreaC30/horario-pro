type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-50 max-w-app -translate-x-1/2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary shadow-glass backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

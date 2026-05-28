export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-secondary" role="status">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
      Cargando…
    </div>
  );
}

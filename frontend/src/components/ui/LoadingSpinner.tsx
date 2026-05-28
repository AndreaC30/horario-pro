export function LoadingSpinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500" role="status">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
      {label}
    </div>
  );
}

export function SkeletonBlock({ className = "h-20" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

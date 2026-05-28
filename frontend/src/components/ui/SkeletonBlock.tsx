export function SkeletonBlock({ className = "h-20" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl3 bg-white/[0.06] ${className}`} />;
}

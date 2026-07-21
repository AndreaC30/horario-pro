import { useEffect, useState } from "react";

/**
 * Animated counter — counts up from 0 to the target value with easing.
 * Inspired by React Bits animated counter.
 */
export function AnimatedCounter({ value, suffix = "", duration = 800 }: { value: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    const start = performance.now();
    const from = display;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (value - from) * eased;
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  const formatted = suffix === "€"
    ? `${display.toFixed(2)} ${suffix}`
    : suffix
      ? `${display.toFixed(1)} ${suffix}`
      : String(Math.round(display));

  return <>{formatted}</>;
}

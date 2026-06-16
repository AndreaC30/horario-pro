import type { ReactNode } from "react";
import { useMemo } from "react";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  /** Velocidad: 'slower' (80s), 'slow' (40s), 'normal' (20s), 'fast' (10s) */
  speed?: "slower" | "slow" | "normal" | "fast";
  /** Dirección: 'left' o 'right' */
  direction?: "left" | "right";
  /** Número de repeticiones del contenido (default: 4) */
  repeat?: number;
  /** Si true, pausa al hacer hover */
  pauseOnHover?: boolean;
};

const SPEED_MAP = { slower: "80s", slow: "40s", normal: "20s", fast: "10s" } as const;

/**
 * Marquee — carrusel horizontal infinito.
 * Inspirado en @magicui/marquee.
 * Duplica el contenido N veces y los anima con CSS.
 */
export function Marquee({
  children,
  className = "",
  speed = "normal",
  direction = "left",
  repeat = 4,
  pauseOnHover = true,
}: MarqueeProps) {
  const items = useMemo(
    () => Array.from({ length: repeat }, (_, i) => i),
    [repeat],
  );

  const animDirection = direction === "left" ? "normal" : "reverse";

  return (
    <div
      className={`group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <div
        className={`flex shrink-0 animate-marquee flex-row items-center gap-6 ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{
          animation: `marquee-scroll ${SPEED_MAP[speed]} linear infinite`,
          animationDirection: animDirection,
        }}
      >
        {items.map((i) => (
          <div key={i} className="shrink-0">
            {children}
          </div>
        ))}
      </div>

      {/*
        Segunda copia para el efecto seamless.
        El keyframe translateX(-50%) + gap requiere duplicar.
      */}
      <div
        className={`flex shrink-0 animate-marquee flex-row items-center gap-6 ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        aria-hidden
        style={{
          animation: `marquee-scroll ${SPEED_MAP[speed]} linear infinite`,
          animationDirection: animDirection,
        }}
      >
        {items.map((i) => (
          <div key={i} className="shrink-0">
            {children}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

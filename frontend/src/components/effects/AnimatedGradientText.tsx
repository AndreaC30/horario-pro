import type { ReactNode } from "react";

type AnimatedGradientTextProps = {
  children: ReactNode;
  className?: string;
  /** Velocidad: 'slow' (6s), 'normal' (3s), 'fast' (1.5s) */
  speed?: "slow" | "normal" | "fast";
  /** Colores del gradiente. Default: accent → cyan → teal → accent */
  colors?: string[];
};

const SPEED_MAP = { slow: "6s", normal: "3s", fast: "1.5s" } as const;

/**
 * AnimatedGradientText — texto con gradiente animado que se desplaza horizontalmente.
 * Inspirado en @magicui/animated-gradient-text.
 */
export function AnimatedGradientText({
  children,
  className = "",
  speed = "normal",
  colors = ["#2563EB", "#06B6D4", "#14B8A6", "#2563EB"],
}: AnimatedGradientTextProps) {
  const gradientColors = colors.join(", ");

  return (
    <>
      <span
        className={`inline-block ${className}`}
        style={{
          backgroundImage: `linear-gradient(to right, ${gradientColors})`,
          backgroundSize: "200% auto",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          animation: `gradient-shift ${SPEED_MAP[speed]} linear infinite`,
        }}
      >
        {children}
      </span>

      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </>
  );
}

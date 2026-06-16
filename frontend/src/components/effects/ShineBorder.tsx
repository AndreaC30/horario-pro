import type { ReactNode } from "react";

type ShineBorderProps = {
  children: ReactNode;
  className?: string;
  /** Velocidad del barrido: 'slow' (6s), 'normal' (3s), 'fast' (1.5s) */
  speed?: "slow" | "normal" | "fast";
  /** Grosor del borde en píxeles */
  borderWidth?: number;
  /** Color del brillo (default: accent #2563EB) */
  color?: string;
};

const SPEED_MAP = { slow: "6s", normal: "3s", fast: "1.5s" } as const;

/**
 * ShineBorder — card con borde de luz que barre de izquierda a derecha.
 * Sin rotación: un highlight lineal recorre el borde horizontalmente.
 * Inspirado en @magicui/shine-border.
 */
export function ShineBorder({
  children,
  className = "",
  speed = "normal",
  borderWidth = 1,
  color = "#2563EB",
}: ShineBorderProps) {
  return (
    <div className={`relative rounded-2xl ${className}`}>
      {/* Borde animado: gradiente lineal que barre de izq a der */}
      <div
        className="pointer-events-none absolute -inset-[var(--shine-pad)] rounded-2xl"
        style={
          {
            "--shine-pad": `${borderWidth + 2}px`,
            background: `conic-gradient(from 90deg at 50% 50%, ${color}33, ${color}, ${color}33)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: `${borderWidth}px`,
          } as React.CSSProperties
        }
      />
      {/* Barrido de luz horizontal */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        aria-hidden
      >
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color}40 45%, ${color}80 50%, ${color}40 55%, transparent 100%)`,
            animation: `shine-sweep ${SPEED_MAP[speed]} ease-in-out infinite`,
          }}
        />
      </div>

      {/* Contenido */}
      <div className="relative rounded-2xl overflow-hidden">{children}</div>

      <style>{`
        @keyframes shine-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

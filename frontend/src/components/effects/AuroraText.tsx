import type { ReactNode } from "react";

type AuroraTextProps = {
  children: ReactNode;
  className?: string;
  /** Colores aurora (3-5). Default: azul → cyan → violeta → teal */
  colors?: string[];
};

/**
 * AuroraText — texto con efecto aurora boreal.
 * Inspirado en @magicui/aurora-text.
 * Usa un gradiente animado con múltiples paradas de color.
 */
export function AuroraText({
  children,
  className = "",
  colors = ["#2563EB", "#06B6D4", "#8B5CF6", "#14B8A6", "#3B82F6"],
}: AuroraTextProps) {
  return (
    <>
      <span
        className={`inline-block ${className}`}
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              60deg,
              ${colors[0]} 0%,
              ${colors[1]} 10%,
              ${colors[2]} 20%,
              ${colors[3]} 30%,
              ${colors[1]} 40%,
              ${colors[0]} 50%
            )
          `,
          backgroundSize: "300% 300%",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          animation: "aurora-wave 8s ease-in-out infinite",
          filter: "drop-shadow(0 0 12px rgba(37, 99, 235, 0.3))",
        }}
      >
        {children}
      </span>

      <style>{`
        @keyframes aurora-wave {
          0%   { background-position: 0% 50%; }
          25%  { background-position: 100% 0%; }
          50%  { background-position: 100% 100%; }
          75%  { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}

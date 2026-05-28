type BrandLogoProps = {
  /** sm/md: icono cuadrado; lg/xl: ancho mayor (login usa xl sin texto duplicado). */
  size?: "sm" | "md" | "lg" | "xl";
  /** false si el PNG ya incluye la palabra WorkShift (p. ej. login). */
  showText?: boolean;
};

const sizeMap = {
  sm: { img: "h-10 w-10", text: "text-lg" },
  md: { img: "h-14 w-14", text: "text-xl" },
  lg: { img: "h-24 w-24", text: "text-2xl" },
  xl: { img: "mx-auto block w-[min(19rem,82vw)] max-w-[19rem] h-auto", text: "text-3xl" },
};

export function BrandLogo({ size = "md", showText = true }: BrandLogoProps) {
  const s = sizeMap[size];
  const alt = showText ? "" : "WorkShift";

  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <img
        src="/brand-logo.png"
        alt={alt}
        className={`${s.img} shadow-glass`}
        width={512}
        height={512}
        decoding="async"
      />
      {showText ? (
        <p className={`${s.text} font-bold tracking-tight text-text-primary`}>
          Work<span className="text-cyan-400">Shift</span>
        </p>
      ) : null}
    </div>
  );
}

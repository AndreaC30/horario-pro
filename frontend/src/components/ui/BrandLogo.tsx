type BrandLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
};

const sizeMap = {
  sm: { img: "h-10 w-10", text: "text-lg" },
  md: { img: "h-14 w-14", text: "text-xl" },
  lg: { img: "h-24 w-24", text: "text-2xl" },
  xl: { img: "mx-auto block w-[min(12rem,60vw)] max-w-[12rem] h-auto", text: "text-2xl" },
};

export function BrandLogo({ size = "md", showText = true }: BrandLogoProps) {
  const s = sizeMap[size];
  const alt = showText ? "" : "WorkShift";

  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <img
        src="/brand-logo.png"
        alt={alt}
        className={s.img}
        width={512}
        height={512}
        decoding="async"
      />
      {showText ? (
        <p className={`${s.text} font-bold tracking-tight text-text-primary`}>
          Work<span className="text-primary">Shift</span>
        </p>
      ) : null}
    </div>
  );
}

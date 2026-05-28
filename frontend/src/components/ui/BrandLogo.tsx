type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

const sizeMap = {
  sm: { img: "h-10 w-10", text: "text-lg" },
  md: { img: "h-14 w-14", text: "text-xl" },
  lg: { img: "h-20 w-20", text: "text-2xl" },
};

export function BrandLogo({ size = "md", showText = true }: BrandLogoProps) {
  const s = sizeMap[size];
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <img
        src="/pwa-192x192.png"
        alt=""
        className={`${s.img} rounded-2xl shadow-glass`}
        width={192}
        height={192}
      />
      {showText ? (
        <p className={`${s.text} font-bold tracking-tight text-text-primary`}>
          Work<span className="text-cyan-400">Shift</span>
        </p>
      ) : null}
    </div>
  );
}

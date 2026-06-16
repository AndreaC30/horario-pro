type BrandLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function BrandLogo({ size = "md", showText = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${sizes[size]} flex items-center justify-center rounded-xl bg-primary text-white font-bold shadow-fab`}>
        <svg className="h-5/6 w-5/6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 8l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>
      {showText ? <span className="text-lg font-bold text-text-primary">WorkShift</span> : null}
    </div>
  );
}

import { Link } from "react-router-dom";

type FabProps = {
  to: string;
  label: string;
};

/** FAB «+ Nueva jornada» — visible sobre la bottom nav en móvil */
export function Fab({ to, label }: FabProps) {
  return (
    <Link
      to={to}
      className="fixed right-4 z-30 flex min-h-touch items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-fab transition duration-200 hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-6"
      aria-label={label}
    >
      <span className="text-lg leading-none" aria-hidden>
        +
      </span>
      <span className="max-[380px]:sr-only">{label.replace("+ ", "")}</span>
    </Link>
  );
}

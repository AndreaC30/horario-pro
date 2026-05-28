import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-touch min-w-touch flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
    isActive ? "text-primary" : "text-slate-500"
  }`;

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-app">
        <NavLink to="/dashboard" className={linkClass}>
          Inicio
        </NavLink>
        <NavLink to="/jornada/nueva" className={linkClass}>
          Jornada
        </NavLink>
        <NavLink to="/historial" className={linkClass}>
          Historial
        </NavLink>
      </div>
    </nav>
  );
}

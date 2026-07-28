import { NavLink, useLocation } from "react-router-dom";
import { IoCalendarOutline, IoHomeOutline, IoPeopleOutline, IoTimeOutline } from "react-icons/io5";
import type { IconType } from "react-icons";

const tabs: { to: string; label: string; Icon: IconType }[] = [
  { to: "/dashboard", label: "Inicio", Icon: IoHomeOutline },
  { to: "/jornada/nueva", label: "Jornada", Icon: IoTimeOutline },
  { to: "/historial", label: "Historial", Icon: IoCalendarOutline },
  { to: "/clientes", label: "Clientes", Icon: IoPeopleOutline },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-[var(--bg-surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex h-[60px] max-w-app md:max-w-3xl">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            state={{ from: location.pathname }}
            className={({ isActive }) =>
              `nav-link h-full ${isActive ? "nav-link-active" : "nav-link-inactive"}`
            }
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="font-mono text-[0.65rem] font-medium tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

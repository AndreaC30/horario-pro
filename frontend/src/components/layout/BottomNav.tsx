import { NavLink } from "react-router-dom";
import { IoCalendarOutline, IoHomeOutline, IoPeopleOutline, IoTimeOutline } from "react-icons/io5";
import type { IconType } from "react-icons";

const tabs: { to: string; label: string; Icon: IconType }[] = [
  { to: "/dashboard", label: "Inicio", Icon: IoHomeOutline },
  { to: "/jornada/nueva", label: "Jornada", Icon: IoTimeOutline },
  { to: "/historial", label: "Historial", Icon: IoCalendarOutline },
  { to: "/clientes", label: "Clientes", Icon: IoPeopleOutline },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-surface/95 backdrop-blur-md supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-app">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
            }
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

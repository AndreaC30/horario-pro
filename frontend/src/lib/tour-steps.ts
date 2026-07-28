export type TourStep = {
  /** Matches `[data-tour="…"]` in the DOM. */
  target: string;
  title: string;
  body: string;
  /** Route that must be active so the target exists (or bottom nav is visible). */
  path?: string;
};

/** Five-step product tour for first-time (and replayable) guidance. */
export const WORKSHIFT_TOUR_STEPS: TourStep[] = [
  {
    target: "hoy",
    title: "Hoy",
    body: "Aquí ves las horas y el estimado del día en cuanto registres una jornada.",
    path: "/dashboard",
  },
  {
    target: "mes",
    title: "Este mes",
    body: "Totales del mes, semana en curso y acceso rápido a una nueva jornada.",
    path: "/dashboard",
  },
  {
    target: "jornada-form",
    title: "Nueva jornada",
    body: "Elige cliente, horario y extras. Así se calculan horas e ingresos.",
    path: "/jornada/nueva",
  },
  {
    target: "nav-clientes",
    title: "Clientes",
    body: "Alta de clientes, color y tarifa horaria para estimar lo que cobras.",
    path: "/clientes",
  },
  {
    target: "nav-historial",
    title: "Historial",
    body: "Consulta y edita jornadas pasadas filtrando por fechas.",
    path: "/historial",
  },
];

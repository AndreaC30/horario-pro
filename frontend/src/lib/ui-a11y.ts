/**
 * Tokens de UI compartidos — estilo denso GDH + azul WorkShift.
 *
 * Radii:
 * - rounded-[10px] → section cards
 * - rounded-xl → modales / toast
 * - rounded-lg → inputs, botones, inner cards
 * - rounded-md → chips
 */

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:border-[var(--accent)]";

export const INPUT_CLASS = `w-full min-w-0 max-w-full min-h-11 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg)] px-3 py-2.5 text-base text-text-primary ${FOCUS_RING}`;

export const BTN_PRIMARY = `inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

export const BTN_SECONDARY = `inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary ${FOCUS_RING}`;

export const BTN_GHOST = `inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-elevated hover:text-text-primary ${FOCUS_RING}`;

export const SECTION_CARD =
  "rounded-[10px] border border-border bg-surface shadow-card";

export const INNER_CARD =
  "rounded-lg border border-border bg-[var(--bg-soft)]";

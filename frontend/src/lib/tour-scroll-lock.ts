/**
 * Tour scroll helpers: hard-lock page interaction while the tour is open;
 * only `[data-guided-tour-controls]` may scroll/receive gestures.
 */

let active = false;
let blockHandler: ((e: Event) => void) | null = null;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;
let savedScrollY = 0;
let prevBody: Partial<CSSStyleDeclaration> = {};
let prevHtmlOverflow = "";

const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isTourControlsTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("[data-guided-tour-controls]"));
}

export function tourScrollLockEnable(): void {
  if (active) return;
  active = true;

  savedScrollY = window.scrollY;
  const body = document.body;
  const html = document.documentElement;

  prevHtmlOverflow = html.style.overflow;
  prevBody = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  };

  html.style.overflow = "hidden";
  html.setAttribute("data-tour-active", "1");
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";

  blockHandler = (e: Event) => {
    if (isTourControlsTarget(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
  };

  keyHandler = (e: KeyboardEvent) => {
    if (isTourControlsTarget(e.target)) return;
    if (SCROLL_KEYS.has(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  document.addEventListener("wheel", blockHandler, { passive: false, capture: true });
  document.addEventListener("touchmove", blockHandler, { passive: false, capture: true });
  document.addEventListener("scroll", blockHandler, { passive: false, capture: true });
  document.addEventListener("keydown", keyHandler, true);
}

export function tourScrollLockDisable(): void {
  if (!active) return;
  active = false;

  const body = document.body;
  const html = document.documentElement;

  if (blockHandler) {
    document.removeEventListener("wheel", blockHandler, true);
    document.removeEventListener("touchmove", blockHandler, true);
    document.removeEventListener("scroll", blockHandler, true);
    blockHandler = null;
  }
  if (keyHandler) {
    document.removeEventListener("keydown", keyHandler, true);
    keyHandler = null;
  }

  html.style.overflow = prevHtmlOverflow;
  html.removeAttribute("data-tour-active");
  body.style.overflow = prevBody.overflow ?? "";
  body.style.position = prevBody.position ?? "";
  body.style.top = prevBody.top ?? "";
  body.style.left = prevBody.left ?? "";
  body.style.right = prevBody.right ?? "";
  body.style.width = prevBody.width ?? "";
  window.scrollTo(0, savedScrollY);
}

/**
 * Programmatic scroll to a target while the tour lock is active.
 * Temporarily releases the fixed-body lock so scrollIntoView can move.
 */
export async function tourScrollToTarget(selector: string): Promise<void> {
  const el = document.querySelector(`[data-tour="${selector}"]`) as HTMLElement | null;
  if (!el || !active) return;

  const body = document.body;
  // Unlock fixed body briefly so we can position the target in view.
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  window.scrollTo(0, savedScrollY);

  el.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
  await waitMs(80);

  const rect = el.getBoundingClientRect();
  const targetY = Math.max(0, window.scrollY + rect.top - 96);
  window.scrollTo({ top: targetY, behavior: "auto" });
  await waitMs(40);

  savedScrollY = window.scrollY;
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
}

export function tourMeasureTarget(
  selector: string,
): { top: number; left: number; width: number; height: number } | null {
  const el = document.querySelector(`[data-tour="${selector}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const pad = 8;
  return {
    top: Math.max(4, r.top - pad),
    left: Math.max(4, r.left - pad),
    width: Math.min(window.innerWidth - 16, r.width + pad * 2),
    height: r.height + pad * 2,
  };
}

/** Wait until the target exists in the DOM (after route change). */
export async function tourWaitForTarget(
  selector: string,
  timeoutMs = 2500,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (document.querySelector(`[data-tour="${selector}"]`)) return true;
    await waitMs(50);
  }
  return false;
}

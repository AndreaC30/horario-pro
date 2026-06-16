import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggle: (e?: React.MouseEvent) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggle: () => {},
});

/**
 * Theme transition: circular reveal from click point.
 * Inspired by Magic UI / React Bits theme toggle patterns.
 */
function transitionTheme(x: number, y: number, cb: () => void) {
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    clip-path: circle(0 at ${x}px ${y}px);
    background: var(--bg-flash, #0F172A);
    transition: clip-path 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  `;
  document.body.appendChild(overlay);

  // Force reflow
  overlay.offsetHeight;

  // Expand
  overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;

  // At the peak, flip the theme
  setTimeout(() => {
    cb();
  }, 150);

  // Clean up
  setTimeout(() => {
    overlay.remove();
  }, 700);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = useCallback(
    (e?: React.MouseEvent) => {
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;

      transitionTheme(x, y, () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      });
    },
    [],
  );

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

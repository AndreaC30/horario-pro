import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import App from "./App";
import { ThemeProvider } from "./hooks/useTheme";
import "./index.css";

// Apply initial dark class before React hydrates (prevents flash)
const stored = localStorage.getItem("theme");
if (stored === "light") {
  document.documentElement.classList.remove("dark");
} else if (stored === "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.classList.add("dark");
}

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);

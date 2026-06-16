/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#070B1E",
        surface: {
          DEFAULT: "#0A194B",
          elevated: "#0F2055",
        },
        border: {
          DEFAULT: "rgba(37,99,235,0.12)",
          strong: "rgba(37,99,235,0.20)",
        },
        primary: {
          DEFAULT: "#2563EB",
          hover: "#3B82F6",
          foreground: "#ffffff",
          muted: "rgba(37,99,235,0.10)",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        text: {
          primary: "#F5F7FA",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
      },
      maxWidth: {
        app: "32rem",
      },
      minHeight: {
        touch: "2.75rem",
      },
      minWidth: {
        touch: "2.75rem",
      },
      borderRadius: {
        xl2: "14px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.24)",
        elevated: "0 4px 6px rgba(0,0,0,0.32), 0 2px 4px rgba(0,0,0,0.16)",
        fab: "0 8px 32px rgba(37,99,235,0.30)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        sheen: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "scale-in": "scale-in 0.3s ease-out both",
        sheen: "sheen 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

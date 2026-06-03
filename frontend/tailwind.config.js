/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B1020",
        surface: {
          DEFAULT: "#12182B",
          elevated: "#161E36",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.10)",
        },
        primary: {
          DEFAULT: "#7C5CFF",
          hover: "#9277FF",
          foreground: "#ffffff",
          muted: "rgba(124,92,255,0.10)",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        text: {
          primary: "#F5F7FA",
          secondary: "#94A3B8",
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
        xl2: "16px",
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.3)",
        fab: "0 8px 32px rgba(124,92,255,0.35)",
      },
      fontFamily: {
        sans: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

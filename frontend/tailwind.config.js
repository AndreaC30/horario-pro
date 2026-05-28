/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
        },
        surface: {
          DEFAULT: "#f8fafc",
          card: "#ffffff",
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
    },
  },
  plugins: [],
};

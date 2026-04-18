import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          900: "#164e63",
        },
        surface: {
          DEFAULT: "#f8fbfc",
          muted: "#eef4f6",
          dark: "#112031",
          "dark-muted": "#1b2b3d",
        },
        favorable: "#22c55e",
        hostile: "#ef4444",
        mixed: "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-host-grotesk)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

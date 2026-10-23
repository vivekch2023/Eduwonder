import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#1E1B4B",
        lavender: {
          light: "#FAF8FF",
          DEFAULT: "#F5F3FF",
          border: "#DDD6FE",
        },
        violet: {
          brand: "#6D28D9",
          hover: "#5B21B6",
          light: "#EDE9FE",
          glow: "#8B5CF6",
          dark: "#4C1D95",
        },
        amber: {
          sunny: "#FBBF24",
          accent: "#D97706",
          light: "#FEF3C7",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        tactile: "0 4px 0 0 #5B21B6",
        "tactile-hover": "0 2px 0 0 #5B21B6",
        card: "0 10px 25px -5px rgba(109, 40, 217, 0.08), 0 8px 10px -6px rgba(109, 40, 217, 0.04)",
        "card-hover": "0 20px 30px -10px rgba(109, 40, 217, 0.15), 0 10px 15px -3px rgba(109, 40, 217, 0.07)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
      },
      keyframes: {
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

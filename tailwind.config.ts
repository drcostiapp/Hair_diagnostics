import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#F8F4EC",
          soft: "#FBF8F1",
          deep: "#EFE8D8",
        },
        gold: {
          DEFAULT: "#C9A86A",
          light: "#E2C896",
          dark: "#9B7E42",
        },
        anchor: {
          DEFAULT: "#14322B",
          soft: "#1F4A40",
          ink: "#0B1F1B",
        },
        whisper: "#A79884",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxe: "0 10px 30px -15px rgba(20, 50, 43, 0.25)",
        card: "0 2px 14px -6px rgba(20, 50, 43, 0.18)",
      },
      backgroundImage: {
        "gold-line":
          "linear-gradient(90deg, transparent 0%, #C9A86A 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        anchor: "#0E2A37",
        champagne: "#D3B57C",
        linen: "#DBCCBB",
        ivory: "#F7F3EE",
        bronze: "#84735F",
        // Subtle variations
        "anchor-soft": "#17394A",
        "champagne-soft": "#E5CFA4",
        "ivory-warm": "#FBF8F4",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Söhne",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: ["Cormorant Garamond", "Didot", "Georgia", "serif"],
      },
      letterSpacing: {
        luxe: "0.15em",
      },
      boxShadow: {
        quiet: "0 1px 2px rgba(14, 42, 55, 0.04), 0 8px 24px rgba(14, 42, 55, 0.06)",
        hover: "0 2px 4px rgba(14, 42, 55, 0.06), 0 16px 40px rgba(14, 42, 55, 0.08)",
      },
      borderRadius: {
        luxe: "14px",
      },
    },
  },
  plugins: [],
};

export default config;

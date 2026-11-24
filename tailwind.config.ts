import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8f0",
          100: "#ffeed6",
          500: "#f97316", // Saffron / Energy
          600: "#ea580c",
          700: "#c2410c",
        },
        trust: {
          50: "#f0fdf4",
          500: "#22c55e", // Green verification badge
          600: "#16a34a",
          700: "#15803d",
        },
      },
      fontSize: {
        "huge-btn": ["1.35rem", { lineHeight: "1.75rem", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
export default config;

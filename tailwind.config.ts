import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom palette — defined as RGB channels so opacity modifiers (bg-forest/20) work
        mint:       "rgb(var(--mint) / <alpha-value>)",
        forest:     "rgb(var(--forest) / <alpha-value>)",
        terracotta: "rgb(var(--terracotta) / <alpha-value>)",
        sand:       "rgb(var(--sand) / <alpha-value>)",
        cream:      "rgb(var(--cream) / <alpha-value>)",
        ink:        "rgb(var(--ink) / <alpha-value>)",
        gray: {
          DEFAULT: "#737373",
          ...require("tailwindcss/colors").gray,
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans:     ["var(--font-montserrat)", "sans-serif"],
        headline: ["var(--font-syne)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "warm-sm": "0 1px 8px rgba(68,92,73,0.08)",
        "warm-md": "0 4px 20px rgba(68,92,73,0.10)",
        "warm-lg": "0 8px 40px rgba(68,92,73,0.13)",
      },
    },
  },
  plugins: [],
};

export default config;

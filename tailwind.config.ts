import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: "#94c1a4",
        forest: "#445c49",
        terracotta: "#823509",
        sand: "#cba178",
        cream: "#f6ede2",
        ink: "#2d2d2d",
        gray: {
          DEFAULT: "#737373",
          ...require("tailwindcss/colors").gray,
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
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

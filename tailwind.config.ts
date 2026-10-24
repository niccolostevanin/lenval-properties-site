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
        background: "var(--background)",
        foreground: "var(--foreground)",
        warm: "#f8f4ee",
        dark: "#121212",
        muted: "#888888",
        accent: "#d4a373",
      },
      fontFamily: {
        sans: ["var(--font-helvetica)", "sans-serif"],
        serif: ["var(--font-financier)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;

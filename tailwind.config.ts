import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-dark": "#0a0e1a",
        "card-dark": "#111827",
        "sidebar-dark": "#0d1321",
        "border-dark": "#1f2937",
        "hover-dark": "#1a2332",
      },
    },
  },
  plugins: [],
};

export default config;

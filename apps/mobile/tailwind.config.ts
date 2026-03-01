import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "siteflow-header": "#5a7a2e",
        "siteflow-header-dark": "#4a6624",
        "siteflow-blue": "#1e40af",
        "siteflow-blue-light": "#3b82f6",
      },
    },
  },
  plugins: [],
} satisfies Config;

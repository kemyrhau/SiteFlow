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
        "sitedoc-header": "#5a7a2e",
        "sitedoc-header-dark": "#4a6624",
        "sitedoc-blue": "#1e40af",
        "sitedoc-blue-light": "#3b82f6",
      },
    },
  },
  plugins: [],
} satisfies Config;

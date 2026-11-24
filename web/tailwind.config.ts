import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // miupa.jp デザイン仕様（DESIGN.md）準拠の配色
        claude: {
          bg: "#FAF9F5",
          surface: "#FFFFFF",
          surface2: "#F0EEE6",
          border: "#E8E4DA",
          text: "#1F1E1D",
          muted: "#6B6963",
          accent: "#D97757",
          accent2: "#C15F3C",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;

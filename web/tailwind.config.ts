import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Claude風の落ち着いた配色
        claude: {
          bg: "#F7F7F5",
          surface: "#FFFFFF",
          border: "#E7E5E4",
          text: "#111827",
          accent: "#6B5CFF", // パープル寄りのアクセント
          accent2: "#A855F7",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;



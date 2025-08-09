import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages の場合、プロジェクトページは "/<repo>/" が必要
const base = "/invest_coach/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
  },
  define: {
    "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(process.env.VITE_GEMINI_API_KEY ?? ""),
    "import.meta.env.VITE_GEMINI_MODEL": JSON.stringify(process.env.VITE_GEMINI_MODEL ?? "gemini-1.5-flash"),
    "import.meta.env.VITE_GEMINI_PROXY_URL": JSON.stringify(process.env.VITE_GEMINI_PROXY_URL ?? ""),
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});



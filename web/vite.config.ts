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
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});



import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base を環境変数で切替可能に（既定は "/" = カスタムドメイン/ルート配信）
// 例: GitHubのプロジェクトページなら VITE_PUBLIC_BASE="/invest_coach/"
const base = process.env.VITE_PUBLIC_BASE ?? "/";

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



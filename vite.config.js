import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // alias cho thư mục src
      "@root": path.resolve(__dirname, "./"), // alias cho thư mục gốc dự án
    },
  },
  server: {
    port: 3001, // Đổi port tại đây
  },
});

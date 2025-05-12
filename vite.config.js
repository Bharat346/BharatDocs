import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    mdx({ remarkPlugins: [remarkGfm] }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "highlight.js/styles/github-dark.css";`
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

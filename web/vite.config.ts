import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // @ts-expect-error bad typing
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    eslint(),
  ],
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
  base: "/sanalouhos-ratkaisija/",
});

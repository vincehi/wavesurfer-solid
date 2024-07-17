// import eslint from "vite-plugin-eslint"; // this is currently not working :( turn this back on when it's fixed
/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import solidPlugin from "vite-plugin-solid";

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, "./examples"),
  plugins: [
    dts({
      entryRoot: path.join(__dirname, "./src"),
      tsconfigPath: path.join(__dirname, "tsconfig.json"),
    }),
    solidPlugin(),
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    minify: true,
    reportCompressedSize: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["solid-js", "wavesurfer.js"], // Remplacez "nom_de_la_bibliotheque" par le nom de la bibliothèque que vous voulez exclure
    },
  },
  test: {
    dir: path.resolve(__dirname, "./"),
    environment: "happy-dom",
    globals: true,
    isolate: false,
  },
});

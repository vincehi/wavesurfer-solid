// import eslint from "vite-plugin-eslint"; // this is currently not working :( turn this back on when it's fixed
import eslintPlugin from "@nabla/vite-plugin-eslint";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { type PluginOption, defineConfig } from "vite";
import dts from "vite-plugin-dts";
import solidPlugin from "vite-plugin-solid";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // eslint({ fix: true }),
    eslintPlugin(),
    visualizer() as PluginOption,
    dts({
      entryRoot: "src",
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
});

import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    minify: true,
    sourcemap: true,
    clean: true,
    target: "es2020",
    treeshake: true,
  },
  {
    entry: ["src/index.ts"],
    format: ["iife"],
    globalName: "NepaliDateLib",
    minify: true,
    sourcemap: true,
    target: "es2020",
    outExtension: () => ({ js: ".global.js" }),
  },
]);

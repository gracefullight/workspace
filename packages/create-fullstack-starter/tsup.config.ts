import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  shims: true,
  target: "node24",
  splitting: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
});

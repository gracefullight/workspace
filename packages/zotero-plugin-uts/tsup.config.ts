import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {'index': 'src/index.ts'},
    format: ['iife'],
    globalName: 'ZoteroPluginUTS',
    outDir: 'addon',
    target: 'es2020',
    noExternal: [/(.*)/],
    minify: false,
    clean: false,
    splitting: false,
  },
  {
    entry: {'bootstrap': 'src/bootstrap.ts'},
    format: ['iife'], // Wrap in IIFE, but assignments to globalThis will leak out to sandbox global
    outDir: 'addon',
    target: 'es2020',
    noExternal: [/(.*)/],
    minify: false,
    clean: false,
    splitting: false,
    outExtension() {
      return {
        js: '.js',
      }
    }
  }
]);

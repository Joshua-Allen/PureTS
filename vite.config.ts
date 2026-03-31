// ============================================================
// vite.config.ts  —  Vite bundler configuration
//
// Vite handles:
//   TypeScript  — transpiles src/ with no extra step
//   SCSS        — compiles .scss imports (requires 'sass' package)
//   Dev server  — hot reload via `npm run dev`
//   Production  — optimised bundle via `npm run build`
//
// Common options to add:
//   base: '/subpath/'        if deploying to a subdirectory
//   build.outDir: 'dist'     output folder (default: 'dist')
//   server.port: 3000        dev server port (default: 5173)
// ============================================================

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
});

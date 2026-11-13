import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/content/content.ts'),
      name: 'SeoCopilotContent',
      formats: ['iife'],
      fileName: () => 'content.js'
    }
  }
});

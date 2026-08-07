import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: { popup: resolve(root, 'index.html'), background: resolve(root, 'src/background/background.ts'), content: resolve(root, 'src/content/content.ts') },
      output: { entryFileNames: '[name].js', chunkFileNames: 'assets/[name].js', assetFileNames: 'assets/[name][extname]' }
    }
  }
});

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { catalogFilePersistPlugin } from './vite/plugins/catalogFilePersist.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react(), catalogFilePersistPlugin()],
  /** Mesma origem para dev e preview: http://localhost:4173 (localStorage partilhado entre os dois comandos). */
  server: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
  },
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
  },
});

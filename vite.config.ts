import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is overridden at build time on GitHub Pages (see .github/workflows/deploy.yml).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/',
});

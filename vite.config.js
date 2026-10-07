import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages has no server-side redirects. Serving a copy of index.html as 404.html
// lets deep links like /stack/react/use-effect load the app on refresh.
const spaFallback404 = () => ({
  name: 'spa-fallback-404',
  closeBundle() {
    const dist = resolve(import.meta.dirname, 'dist');
    copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
  },
});

export default defineConfig({
  // '/' locally and on Vercel/Netlify; the GitHub Pages workflow sets BASE_PATH=/<repo-name>/
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss(), spaFallback404()],
  build: {
    // The bundle is mostly study content (all stacks are loaded up front so global
    // search works offline). It's a local app, so a large single chunk is fine.
    chunkSizeWarningLimit: 12000,
  },
});

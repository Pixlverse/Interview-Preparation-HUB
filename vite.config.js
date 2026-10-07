import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The bundle is mostly study content (all stacks are loaded up front so global
    // search works offline). It's a local app, so a large single chunk is fine.
    chunkSizeWarningLimit: 12000,
  },
});

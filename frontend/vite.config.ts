import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // En dev, les appels /api sont relayés vers le backend Flask configuré
      // via VITE_API_URL (aucune URL backend codée en dur dans le code applicatif).
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

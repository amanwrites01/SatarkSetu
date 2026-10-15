import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run dev` serves the React app and forwards /api calls to the Python backend.
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
  server: {
    port: 5173,
    proxy: { '/api': process.env.API_URL || 'http://localhost:8000' },
  },
});

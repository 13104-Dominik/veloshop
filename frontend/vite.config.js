import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// W trybie dev zapytania /api trafiają do backendu na porcie 3000
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } },
});

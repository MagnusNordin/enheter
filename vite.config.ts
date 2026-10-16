import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Served from https://magnusnordin.github.io/enheter/
export default defineConfig({
  base: '/enheter/',
  plugins: [react()],
});

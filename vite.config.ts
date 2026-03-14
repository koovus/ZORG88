import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: 'all',
  },
});

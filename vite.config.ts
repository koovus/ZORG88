import { defineConfig } from 'vite';
import type { Connect } from 'vite';

export default defineConfig({
  publicDir: 'public',
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
  plugins: [
    {
      name: 'redirect-old-game',
      configureServer(server) {
        server.middlewares.use((req: Connect.IncomingMessage, res, next) => {
          if (req.url && req.url.includes('LunarLander3.js')) {
            res.writeHead(302, { Location: '/' });
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
});

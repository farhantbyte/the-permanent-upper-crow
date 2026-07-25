import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    // Allow Cloudflare-tunnel hostnames (any *.trycloudflare.com
    // subdomain plus the broader .cfargotunnel.com) so dev runs
    // can be shared over a tunnel without Vite rejecting the host.
    allowedHosts: ['.trycloudflare.com', '.cfargotunnel.com'],
  },
});

import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: { input: { game: 'index.html', figures: 'figuren.html' } },
  },
});

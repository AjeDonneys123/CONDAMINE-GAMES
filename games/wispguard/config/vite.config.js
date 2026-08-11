import { defineConfig } from 'vite';

export default defineConfig({
  // Chemin absolu : Vercel retire `index.html` avec cleanUrls. Sans cela,
  // le navigateur cherche le bundle dans /assets au lieu de /wispguard/assets.
  base: "/wispguard/",
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 3000,
  },
});

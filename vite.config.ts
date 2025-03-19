import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Determine if we're building for GitHub Pages or another platform
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Only use the /resume-ai/ base path when building for GitHub Pages
  base: isGitHubPages ? '/resume-ai/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
});

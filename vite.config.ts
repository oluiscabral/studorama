import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make APP_VERSION available at build time
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || 'dev'),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react']
        }
      }
    },
    sourcemap: false, // Disable sourcemaps in production to reduce bundle size
    minify: 'esbuild', // Use esbuild instead of terser for faster builds
    target: 'esnext'
  },
  server: {
    fs: {
      strict: false
    }
  }
});
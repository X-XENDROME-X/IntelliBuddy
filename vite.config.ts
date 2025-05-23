import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: false,      // Disable polling for better performance
      interval: 1000,         // Slower file watching interval (less CPU usage)
    },
    hmr: {
      clientPort: 5173,       // Ensure proper HMR connections
    },
    fs: {
      strict: false,          // Less strict file resolution (better performance)
    }
  },
  // Optimize build
  build: {
    target: 'esnext',         // Modern browsers only for better performance
    minify: 'esbuild',        // Faster minification
    cssMinify: 'lightningcss', // Faster CSS minification
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'], // Pre-bundle common dependencies
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, 
    },
    hmr: {
      clientPort: 5173,
    },
    fs: {
      strict: false,
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Important: don't clear the output directory
    sourcemap: process.env.NODE_ENV !== 'production',
    lib: {
      entry: resolve(__dirname, 'src/content.tsx'),
      name: 'content',
      formats: ['iife'],
      fileName: () => 'content.js'
    },
    rollupOptions: {
      // Make sure to bundle all dependencies into the content script
      // except Chrome API
      external: ['chrome'],
      output: {
        globals: {
          chrome: 'chrome'
        },
        // This ensures styles are inlined in the IIFE bundle
        inlineDynamicImports: true
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
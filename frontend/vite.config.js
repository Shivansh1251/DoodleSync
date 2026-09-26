import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  plugins: [
    react(),
    tailwindcss()
  ],
  optimizeDeps: {
    include: ['tldraw']
  },
  assetsInclude: ['**/*.woff', '**/*.woff2'],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    manifest: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 300,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('tldraw') || id.includes('@tldraw')) return 'vendor-tldraw'
          if (id.includes('/three/')) return 'vendor-three'
          if (id.includes('socket.io-client') || id.includes('engine.io-client')) return 'vendor-socket'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('/motion/') || id.includes('/framer-motion/') || id.includes('/motion-dom/') || id.includes('/motion-utils/')) return 'vendor-motion'
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('/react/') || id.includes('react-dom')) return 'vendor-react'
          return 'vendor'
        }
      }
    }
  }
})

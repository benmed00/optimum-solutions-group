/// <reference types="vitest" />

import { fileURLToPath } from 'url';
import { defineConfig, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { dirname, resolve } from 'path';
import type { UserConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
const config = async ({ mode }: ConfigEnv): Promise<UserConfig> => ({
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        (await import('tailwindcss')).default,
        (await import('autoprefixer')).default,
      ],
    },
  },
  server: {
    host: "localhost",
    port: 8080,
    strictPort: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
    hmr: {
      port: 8080,
      host: 'localhost',
    },
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : 'esbuild',
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    } : undefined,
    cssMinify: true,
    target: 'es2020',
    // Advanced build optimizations
    cssCodeSplit: true,
    assetsInlineLimit: 2048, // Reduced to 2kb for better HTTP/2 optimization
    chunkSizeWarningLimit: 500, // Stricter warning for better performance
    rollupOptions: {
      // Only externalize specific development/testing dependencies
      external: (id) => {
        // Only exclude specific development dependencies, not all node_modules
        return id.includes('@testing-library') || 
               id.includes('vitest') ||
               id.includes('jsdom') ||
               id.includes('cypress');
      },
      output: {
        // Split heavy charting libraries into dedicated vendor chunks.
        // recharts (~200 kB) + its d3-* dependencies (~300 kB) are only used
        // by AnalyticsPage; without this they inflate that page's chunk to
        // 400+ kB. Split them separately so each chunk stays under 400 kB.
        // NOTE: Do NOT manually chunk react/react-dom/react-router-dom —
        // those packages have complex circular inter-dependencies that Vite
        // handles safely on its own; forcing them into a manualChunk produces
        // a TDZ "Cannot access before initialization" crash at runtime.
        manualChunks: (id) => {
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts';
          }
          if (id.includes('node_modules/d3-') || id.includes('node_modules/d3/')) {
            return 'vendor-d3';
          }
        },

        // Optimized file naming for better caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: (chunkInfo) => {
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const extType = info[info.length - 1];
          
          // Organize assets by type for better caching
          if (/\.(png|jpe?g|gif|svg|ico|webp|avif)$/i.test(assetInfo.name!)) {
            return `assets/images/[name]-[hash].${extType}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name!)) {
            return `assets/fonts/[name]-[hash].${extType}`;
          }
          if (/\.(css)$/i.test(assetInfo.name!)) {
            return `assets/styles/[name]-[hash].${extType}`;
          }
          
          return `assets/[name]-[hash].${extType}`;
        },
        
        // Preserve module structure for better debugging
        preserveModules: false,
        preserveModulesRoot: 'src',
        
        // Optimize for HTTP/2
        compact: true,
      },
      
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: (id, external) => {
          // Always preserve side effects for our own source files (React render calls,
          // event listeners, etc. are top-level side effects that must not be stripped).
          if (!id.includes('node_modules')) return true;
          // Preserve side effects for CSS and known libraries with side effects
          return id.endsWith('.css') ||
                 id.includes('polyfill') ||
                 id.includes('web-vitals') ||
                 external;
        },
        // Keep unknownGlobalSideEffects true for source files (handled above);
        // setting false only applies to node_modules now.
        unknownGlobalSideEffects: false,
      },
    },
  },
  plugins: [
    // Serve /api and /api-docs before SPA fallback (avoids 404 from React Router)
    {
      name: 'api-docs-rewrite',
      enforce: 'pre',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] ?? '';
          if (url === '/api' || url === '/api/') {
            req.url = '/api/index.html';
          } else if (url === '/api-docs' || url === '/api-docs/') {
            req.url = '/api-docs/index.html';
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] ?? '';
          if (url === '/api' || url === '/api/') {
            req.url = '/api/index.html';
          } else if (url === '/api-docs' || url === '/api-docs/') {
            req.url = '/api-docs/index.html';
          }
          next();
        });
      },
    },
    react(),
    mode === 'development' && (await import('lovable-tagger')).componentTagger(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // Ensure single React instance
      "react": resolve(__dirname, "./node_modules/react"),
      "react-dom": resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ['react', 'react-dom'],
  },
  ssr: {
    noExternal: ["lovable-tagger"],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});

export default defineConfig(config);

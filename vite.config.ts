import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      output: {
        // vite 8 (rolldown) はオブジェクト形式非対応のため関数形式
        manualChunks: (id: string) => {
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/@kurkle')) {
            return 'chart'
          }
        },
        // 本番ビルドで console.log/debugger を除去 (旧 esbuild.drop 相当)
        minify: {
          mangle: true,
          codegen: {
            removeWhitespace: true,
          },
          compress: {
            target: 'es2020',
            dropConsole: true,
            dropDebugger: true,
          },
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    host: true, // SP試遊用: LAN内からアクセス可能に
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'ビジネスエンパイア 2.0 - 経営シミュレーション',
        short_name: 'ビジネスエンパイア',
        description: '本格的な経営シミュレーションゲーム',
        theme_color: '#667eea',
        background_color: '#667eea',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ja',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect width="192" height="192" fill="%23667eea" rx="24"/><text x="96" y="110" font-size="80" text-anchor="middle" fill="white">🏢</text></svg>',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="%23667eea" rx="64"/><text x="256" y="300" font-size="200" text-anchor="middle" fill="white">🏢</text></svg>',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
})

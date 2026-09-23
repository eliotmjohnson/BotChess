import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/bot-chess/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Bot Chess',
        short_name: 'Bot Chess',
        description: 'Play chess against a bot — slick, offline-friendly PWA.',
        theme_color: '#0f1419',
        background_color: '#0f1419',
        display: 'standalone',
        start_url: '/bot-chess/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})

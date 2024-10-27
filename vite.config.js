import { resolve } from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Liste der Routen mit möglichen dynamischen Parametern
const dynamicRoutes = ['sharing', 'lending', 'items', 'user'];

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        settings: resolve(__dirname, 'settings/index.html'),
        sharing: resolve(__dirname, 'sharing/index.html'),
        user: resolve(__dirname, 'user/index.html'),
        items: resolve(__dirname, 'items/index.html'),
        lending: resolve(__dirname, 'lending/index.html'),
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      strategies: 'injectManifest',
      injectRegister: 'auto',
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST'
      },
      manifest : {
        theme_color: '#3c0790',
        icons: [
          {
            src: '/fljota_offline.svg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/fljota_offline.svg',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})

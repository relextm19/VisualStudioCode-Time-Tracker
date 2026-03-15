import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        proxy: {
            // When your frontend calls /api/login...
            '/api': {
                target: 'http://localhost:42069', // Fixed: Colon instead of slash
                changeOrigin: true,
                // Fixed: Removed quotes around the regex
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})

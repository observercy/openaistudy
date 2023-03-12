import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  envDir: path.resolve(__dirname, "config"),
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 4200
  },
  css: {
    preprocessorOptions: {
      less: {
        charset: false,
      },
    },
  },
})

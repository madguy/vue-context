import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: 'src/vue-context.vue',
      name: 'vue-context',
    },
    minify: true,
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        assetFileNames(assetInfo) {
          if (assetInfo.name === 'style.css') {
            return 'css/vue-context.css';
          }
          return assetInfo.name ?? '[name][extname]';
        },
      },
    },
  },
});

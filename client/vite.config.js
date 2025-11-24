import { defineConfig } from 'vite'
  import vue from '@vitejs/plugin-vue'
  import path from 'path'

  // https://vite.dev/config/
  export default defineConfig({
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // 配置 Vue 将这些标签视为自定义元素
            isCustomElement: (tag) => {
              return tag === 'vue-advanced-chat' || tag === 'emoji-picker'
            }
          }
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')  // ← 添加这个配置
      }
    }
  })
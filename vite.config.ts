import { resolve } from 'path'; 
import { defineConfig } from 'vite'

export default defineConfig({
  base: "/box3-static-tool",
  build:{
    outDir: "docs",
  },
  resolve:{
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  }
})
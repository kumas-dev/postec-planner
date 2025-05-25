import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/main.ts'],
  outDir: 'dist',
  format: ['cjs'],
  dts: true,
  clean: true,
  tsconfig: './tsconfig.json',
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    }
  },
})

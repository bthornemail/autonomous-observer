import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'UnifiedFramework',
      fileName: 'unified-framework'
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  },
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
});
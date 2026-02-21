// vitest.config.ts
// À placer à la RACINE du projet (au même niveau que package.json)

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/app/models/**/*.ts'],
      exclude: ['**/*.spec.ts']
    }
  }
});

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    // e2e specs use Playwright's own runner (npm run test:e2e).
    // Excluding them here keeps `npm test` a clean unit-only run and
    // fixes the "test.describe() called here" crash vitest throws when
    // it tries to import a Playwright spec as a vitest file.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

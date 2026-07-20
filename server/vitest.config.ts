import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest Configuration for Interview Diaries Backend
 *
 * Vitest uses esbuild to transform TypeScript on-the-fly, so test files
 * can import .ts source files directly without a prior `tsc` compilation step.
 *
 * Key decisions:
 * - environment: 'node' — Express app, not a browser app.
 * - globalSetup: runs ONCE before all test suites (DB connection + migrations).
 * - setupFiles: runs before EACH test file (truncate tables for isolation).
 * - testTimeout: 15s — DB operations can be slower than default 5s.
 * - coverage: via @vitest/coverage-v8 (V8 native — no instrumentation overhead).
 */
export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './src/__tests__/helpers/globalSetup.ts',
    setupFiles: ['./src/__tests__/helpers/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 30000,
    include: ['src/__tests__/**/*.test.ts'],
    // Run test FILES sequentially to prevent cross-file DB state conflicts
    // (individual tests within a file still run in order by default)
    fileParallelism: false,
    pool: 'forks',
    forks: {
      singleFork: true,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/services/**', 'src/repositories/**', 'src/utils/**', 'src/middleware/**'],
      exclude: ['src/__tests__/**', 'src/config/**', 'src/types/**'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.ts', '.js', '.json'],
  },

  esbuild: {
    target: 'node18',
  },
});

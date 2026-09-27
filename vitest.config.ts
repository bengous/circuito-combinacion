import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
      // tokens.css is processed so that tests can read it with `?raw` (see src/test/themeTokens.ts).
      css: { include: [/tokens\.css/], modules: { classNameStrategy: 'non-scoped' } },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
        reporter: ['text-summary', 'html'],
        // A floor, not a target: raise it when coverage grows, never lower it to get green.
        thresholds: {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 92,
          // The electrical model is tested exhaustively (every combination of every circuit).
          'src/domain/**': { statements: 95, branches: 80, functions: 100, lines: 95 },
        },
      },
    },
  }),
);

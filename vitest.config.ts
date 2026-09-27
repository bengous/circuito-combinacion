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
    },
  }),
);

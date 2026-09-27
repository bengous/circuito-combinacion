import type { KnipConfig } from 'knip';

/**
 * Finds unused files, exports and dependencies (`npm run lint:unused`).
 * Entry points (src/main.tsx, tests, e2e, configs) come from Knip's Vite, Vitest and
 * Playwright plugins.
 */
const config: KnipConfig = {
  // Types that name part of a module's vocabulary (e.g. `Lamp` in domain/circuit/types.ts)
  // may stay exported when the same file uses them. Values may not.
  ignoreExportsUsedInFile: { interface: true, type: true },
};

export default config;

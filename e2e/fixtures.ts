import { test as base, expect, type Page } from '@playwright/test';
import type { TextSize } from '../src/features/settings/settings';
import type { Theme } from '../src/features/settings/theme';

/** Mirrors src/features/settings/persistence.ts. */
const SETTINGS_KEY = 'circuito.settings.v1';

export type { TextSize, Theme };

export const CIRCUITS = [
  { id: 'combinacion-simple', points: 2, title: 'Combinación simple' },
  { id: 'combinacion-con-cruce', points: 3, title: 'Combinación con cruce' },
  { id: 'combinacion-dos-cruces', points: 4, title: 'Combinación con dos cruces' },
] as const;

interface Options {
  /** Saved settings the page starts with, as the app stores them. */
  readonly settings: { readonly theme?: Theme; readonly textSize?: TextSize };
}

/**
 * `test` with saved settings (`test.use({ settings: { theme: 'day' } })`) and a guard:
 * any console error or uncaught exception fails the test.
 */
export const test = base.extend<Options & { consoleErrors: string[] }>({
  settings: [{}, { option: true }],
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(String(error)));
      await use(errors);
      expect(errors, 'console errors').toEqual([]);
    },
    { auto: true },
  ],
  page: async ({ page, settings }, use) => {
    await page.addInitScript(
      ([key, value]) => {
        // Only seed once: a reload must show what the app saved itself.
        if (sessionStorage.getItem('e2e-seeded')) return;
        sessionStorage.setItem('e2e-seeded', '1');
        localStorage.setItem(key, value);
      },
      [SETTINGS_KEY, JSON.stringify(settings)] as const,
    );
    await use(page);
  },
});

export { expect };

export async function openCircuit(page: Page, id: (typeof CIRCUITS)[number]['id']) {
  await page.goto(`./#${id}`);
  await expect(page.getByRole('group', { name: /^Esquema:/ })).toBeVisible();
}

/** The interactive drawing of the current circuit. */
export const schematic = (page: Page) => page.getByRole('group', { name: /^Esquema:/ });

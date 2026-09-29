import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, openCircuit, type Theme, test } from './fixtures';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// One circuit per case, so every circuit of the menu is scanned at least once.
const CASES = [
  { viewport: { width: 390, height: 664 }, textSize: 'normal', circuit: 'combinacion-simple' },
  { viewport: { width: 390, height: 664 }, textSize: 'huge', circuit: 'combinacion-con-cruce' },
  { viewport: { width: 844, height: 390 }, textSize: 'huge', circuit: 'combinacion-dos-cruces' },
] as const;

async function violations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`);
}

for (const theme of ['night', 'day'] satisfies Theme[]) {
  for (const { viewport, textSize, circuit } of CASES) {
    test.describe(`axe, ${theme}, ${viewport.width}x${viewport.height}, ${textSize}, ${circuit}`, () => {
      test.use({ viewport, settings: { theme, textSize } });

      test('main screen, lamp on and off', async ({ page }) => {
        await openCircuit(page, circuit);
        expect(await violations(page)).toEqual([]);
        await page.getByRole('button', { name: /^Llave 2/ }).click();
        await expect(page.getByRole('status')).toHaveText('Lámpara apagada');
        expect(await violations(page)).toEqual([]);
      });

      test('settings dialog open', async ({ page }) => {
        await openCircuit(page, circuit);
        await page.getByRole('button', { name: 'Ajustes' }).click();
        await expect(page.getByRole('dialog', { name: 'Ajustes' })).toBeVisible();
        expect(await violations(page)).toEqual([]);
      });
    });
  }
}

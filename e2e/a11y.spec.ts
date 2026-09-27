import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, openCircuit, type Theme, test } from './fixtures';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function violations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`);
}

for (const theme of ['night', 'day'] satisfies Theme[]) {
  test.describe(`axe, ${theme} theme`, () => {
    test.use({ viewport: { width: 390, height: 664 }, settings: { theme } });

    test('main screen, lamp on and off', async ({ page }) => {
      await openCircuit(page, 'combinacion-con-cruce');
      expect(await violations(page)).toEqual([]);
      await page.getByRole('button', { name: /^Llave 2/ }).click();
      await expect(page.getByRole('status')).toHaveText('Lámpara apagada');
      expect(await violations(page)).toEqual([]);
    });

    test('settings dialog open', async ({ page }) => {
      await openCircuit(page, 'combinacion-simple');
      await page.getByRole('button', { name: 'Ajustes' }).click();
      await expect(page.getByRole('dialog', { name: 'Ajustes' })).toBeVisible();
      expect(await violations(page)).toEqual([]);
    });
  });
}

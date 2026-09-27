import { CIRCUITS, expect, openCircuit, type TextSize, type Theme, test } from './fixtures';
import {
  controls,
  drawingSize,
  horizontalOverflow,
  isReachable,
  TAP_MIN,
  TEXT_SCALE,
} from './measure';

// Small phone, iPhone portrait (Safari bars shown), iPhone landscape, laptop.
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 664 },
  { width: 844, height: 390 },
  { width: 1280, height: 800 },
] as const;
const TEXT_SIZES: readonly TextSize[] = ['normal', 'huge'];
const THEMES: readonly Theme[] = ['night', 'day'];

for (const viewport of VIEWPORTS) {
  for (const textSize of TEXT_SIZES) {
    for (const theme of THEMES) {
      test.describe(`${viewport.width}x${viewport.height}, ${textSize} text, ${theme}`, () => {
        test.use({ viewport, settings: { textSize, theme } });

        for (const circuit of CIRCUITS) {
          test(`${circuit.points} points: fits the width, readable, every control reachable`, async ({
            page,
          }) => {
            await openCircuit(page, circuit.id);

            expect(await horizontalOverflow(page), 'horizontal overflow (px)').toBeLessThanOrEqual(
              0,
            );

            const drawing = await drawingSize(page, TEXT_SCALE[textSize]);
            expect(
              drawing.visibleHeight,
              'visible drawing height vs its floor',
            ).toBeGreaterThanOrEqual(drawing.floor - 1);

            const all = await controls(page);
            for (const control of all) {
              expect.soft(control.width, `${control.name} width`).toBeGreaterThanOrEqual(TAP_MIN);
              expect.soft(control.height, `${control.name} height`).toBeGreaterThanOrEqual(TAP_MIN);
            }
            for (const [index, control] of all.entries()) {
              expect.soft(await isReachable(page, index), `${control.name} reachable`).toBe(true);
            }
          });
        }
      });
    }
  }
}

// The everyday case must not need scrolling: drawing, message and actions on one screen.
for (const viewport of [
  { width: 360, height: 740 },
  { width: 390, height: 664 },
]) {
  test.describe(`${viewport.width}x${viewport.height}, normal text`, () => {
    test.use({ viewport });

    for (const circuit of CIRCUITS.filter((c) => c.points <= 3)) {
      test(`${circuit.points} points fit on one screen`, async ({ page }) => {
        await openCircuit(page, circuit.id);
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        expect(height).toBeLessThanOrEqual(viewport.height);
        await expect(page.getByRole('button', { name: 'Demo' })).toBeInViewport();
      });
    }
  });
}

// 200% browser zoom on a 360px phone: still no sideways scrolling.
test.describe('180x370 (200% zoom), huge text', () => {
  test.use({ viewport: { width: 180, height: 370 }, settings: { textSize: 'huge' } });

  for (const circuit of CIRCUITS) {
    test(`${circuit.points} points: no horizontal overflow`, async ({ page }) => {
      await openCircuit(page, circuit.id);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    });
  }
});

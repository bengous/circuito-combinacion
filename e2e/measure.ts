import type { Page } from '@playwright/test';
import { MIN_SCALE } from '../src/features/schematic/scale';
import { TEXT_SCALE } from '../src/features/settings/settings';

/** Smallest comfortable tap target (Apple HIG, WCAG 2.5.5). */
export const TAP_MIN = 44;

export { TEXT_SCALE };

export interface DrawingSize {
  /** Height of the drawing box, minus what a scrolling ancestor cuts off. */
  readonly visibleHeight: number;
  /** Natural size x MIN_SCALE x text scale, capped by the width (see Schematic.module.css). */
  readonly floor: number;
}

export function drawingSize(page: Page, textScale: number): Promise<DrawingSize> {
  return page.evaluate(
    ([scale, minScale]) => {
      const svg = document.querySelector<SVGSVGElement>('svg[role="group"]');
      if (!svg) throw new Error('No schematic on the page');
      const box = svg.getBoundingClientRect();
      let top = box.top;
      let bottom = box.bottom;
      // An ancestor that clips (overflow other than visible) may hide part of the drawing.
      for (
        let node = svg.parentElement;
        node && node !== document.body;
        node = node.parentElement
      ) {
        if (getComputedStyle(node).overflowY === 'visible') continue;
        const clip = node.getBoundingClientRect();
        top = Math.max(top, clip.top);
        bottom = Math.min(bottom, clip.bottom);
      }
      const { width, height } = svg.viewBox.baseVal;
      const floor = Math.min(height * minScale * scale, (box.width * height) / width);
      return { visibleHeight: Math.max(0, bottom - top), floor };
    },
    [textScale, MIN_SCALE] as const,
  );
}

export function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

export interface Control {
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Every control of the page outside dialogs, with the size of what a finger can hit
 * (for a checkbox, its label).
 */
export function controls(page: Page): Promise<Control[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement | SVGElement>('button, [role="button"], input')]
      .filter((element) => !element.closest('dialog'))
      .map((element) => {
        const target =
          element instanceof HTMLInputElement ? (element.closest('label') ?? element) : element;
        const box = target.getBoundingClientRect();
        const name = element.getAttribute('aria-label') ?? target.textContent ?? element.tagName;
        return { name: name.trim(), width: box.width, height: box.height };
      }),
  );
}

/** Scrolls the control into view and tells whether a tap at its centre would reach it. */
export function isReachable(page: Page, index: number): Promise<boolean> {
  return page.evaluate((i) => {
    const element = [
      ...document.querySelectorAll<HTMLElement | SVGElement>('button, [role="button"], input'),
    ].filter((candidate) => !candidate.closest('dialog'))[i];
    if (!element) return false;
    element.scrollIntoView({ block: 'center', inline: 'center' });
    const box = element.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) return false;
    const hit = document.elementFromPoint(x, y);
    const target =
      element instanceof HTMLInputElement ? (element.closest('label') ?? element) : element;
    return hit !== null && (target.contains(hit) || hit.contains(target));
  }, index);
}

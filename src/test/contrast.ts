// WCAG 2 colour contrast, for tests that guard the palette. Colours are "#rrggbb".

function channels(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!match) throw new Error(`Not a #rrggbb colour: "${hex}"`);
  const [, r = '', g = '', b = ''] = match;
  return [r, g, b].map((part) => Number.parseInt(part, 16) / 255) as [number, number, number];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** The colour seen when `color` is drawn with `opacity` over `background`. */
export function blend(color: string, background: string, opacity: number): string {
  const top = channels(color);
  const bottom = channels(background);
  const mixed = top.map((c, i) =>
    Math.round((c * opacity + (bottom[i] ?? 0) * (1 - opacity)) * 255),
  );
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

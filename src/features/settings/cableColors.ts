import type { Theme, ThemedColor } from './theme';

/**
 * Cable colours offered in the settings, named as an electrician says them.
 * Each has a value per theme: light tones vanish on the day background, so the day
 * values are darker. Every value keeps at least 3:1 against its theme's background and
 * switch body (WCAG 1.4.11), even faded; `cableColors.test.ts` checks it.
 */
export const CABLE_COLORS = {
  rojo: { night: '#E53935', day: '#E53935' },
  marron: { night: '#B0703E', day: '#B0703E' },
  naranja: { night: '#F28C28', day: '#B86200' },
  amarillo: { night: '#E0AE00', day: '#8A6A00' },
  verde: { night: '#2E9E4F', day: '#2B8A45' },
  celeste: { night: '#29A8E0', day: '#1B7FB5' },
  azul: { night: '#3D72E8', day: '#3D72E8' },
  violeta: { night: '#9C5BD9', day: '#9C5BD9' },
  gris: { night: '#8A96A3', day: '#6E7A87' },
} as const satisfies Record<string, ThemedColor>;

export type CableColorId = keyof typeof CABLE_COLORS;

export const CABLE_COLOR_IDS = Object.keys(CABLE_COLORS) as CableColorId[];

export function isCableColor(value: unknown): value is CableColorId {
  return typeof value === 'string' && Object.hasOwn(CABLE_COLORS, value);
}

/** The colour as drawn in the given theme. */
export function cableColor(id: CableColorId, theme: Theme): string {
  return CABLE_COLORS[id][theme];
}

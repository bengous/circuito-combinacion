/** Cable colours offered in the settings. Mid-tones, readable on both themes. */
export const CABLE_COLORS = {
  rojo: '#E53935',
  marron: '#B0703E',
  naranja: '#F28C28',
  amarillo: '#E0AE00',
  verde: '#2E9E4F',
  celeste: '#29A8E0',
  azul: '#3D72E8',
  violeta: '#9C5BD9',
  gris: '#8A96A3',
} as const;

export type CableColorId = keyof typeof CABLE_COLORS;

export const CABLE_COLOR_IDS = Object.keys(CABLE_COLORS) as CableColorId[];

export function isCableColor(value: unknown): value is CableColorId {
  return typeof value === 'string' && Object.hasOwn(CABLE_COLORS, value);
}

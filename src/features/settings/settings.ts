import type { ConductorRole } from '@/domain/circuit';
import { type CableColorId, isCableColor } from './cableColors';
import { THEMES, type Theme } from './theme';

export type TextSize = 'normal' | 'large' | 'huge';
export type WireColors = Readonly<Record<ConductorRole, CableColorId>>;

export interface Settings {
  readonly theme: Theme;
  readonly textSize: TextSize;
  /** Paint live cables in the phase colour even when no current flows. */
  readonly showTension: boolean;
  readonly wireColors: WireColors;
}

export const TEXT_SCALE: Readonly<Record<TextSize, number>> = { normal: 1, large: 1.15, huge: 1.3 };

export const ROLES: readonly ConductorRole[] = ['phase', 'neutral', 'return', 'bridge'];

export const DEFAULT_SETTINGS: Settings = {
  theme: 'night',
  textSize: 'normal',
  showTension: true,
  wireColors: { phase: 'rojo', neutral: 'celeste', return: 'naranja', bridge: 'violeta' },
};

const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (values as readonly string[]).includes(value);

function field(raw: unknown, key: string): unknown {
  return typeof raw === 'object' && raw !== null
    ? (raw as Record<string, unknown>)[key]
    : undefined;
}

/** Reads settings saved by any version of the app, falling back to defaults field by field. */
export function parseSettings(raw: unknown): Settings {
  const theme = field(raw, 'theme');
  const textSize = field(raw, 'textSize');
  const showTension = field(raw, 'showTension');
  const colors = field(raw, 'wireColors');
  const wireColors = Object.fromEntries(
    ROLES.map((role) => {
      const saved = field(colors, role);
      return [role, isCableColor(saved) ? saved : DEFAULT_SETTINGS.wireColors[role]];
    }),
  ) as Record<ConductorRole, CableColorId>;

  return {
    theme: isOneOf(THEMES, theme) ? theme : DEFAULT_SETTINGS.theme,
    textSize: isOneOf<TextSize>(['normal', 'large', 'huge'], textSize)
      ? textSize
      : DEFAULT_SETTINGS.textSize,
    showTension: typeof showTension === 'boolean' ? showTension : DEFAULT_SETTINGS.showTension,
    wireColors,
  };
}

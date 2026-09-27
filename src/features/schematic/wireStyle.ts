import type { ConductorRole, ConductorStatus } from '@/domain/circuit';

/** Colour family of a line. Each maps to a CSS variable (see Schematic.module.css). */
export type WireTone = ConductorRole | 'dead' | 'arm' | 'active';

export interface WireStyle {
  readonly tone: WireTone;
  /** Animated dashes: current is flowing. */
  readonly flowing: boolean;
  /** Drawn thick and opaque, or thin and faded. */
  readonly strong: boolean;
}

/**
 * With `showTension`, colour tells the potential (phase colour = live) and motion tells current.
 * Without it, cables keep their role colour and only the current path stands out.
 */
export function conductorStyle(
  role: ConductorRole,
  status: ConductorStatus,
  showTension: boolean,
): WireStyle {
  const flowing = status === 'current';
  if (!showTension) return { tone: role, flowing, strong: flowing };
  if (status === 'current' || status === 'live') {
    return { tone: role === 'neutral' ? 'neutral' : 'phase', flowing, strong: true };
  }
  if (status === 'neutral') return { tone: 'neutral', flowing: false, strong: false };
  return { tone: 'dead', flowing: false, strong: false };
}

/** Moving parts inside a switch (the arm, the cruce links). */
export function contactStyle(status: ConductorStatus, showTension: boolean): WireStyle {
  if (showTension && (status === 'current' || status === 'live')) {
    return { tone: 'phase', flowing: false, strong: true };
  }
  return { tone: status === 'current' ? 'active' : 'arm', flowing: false, strong: true };
}

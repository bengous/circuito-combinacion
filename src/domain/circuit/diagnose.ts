import { terminalOf } from './devices';
import type { CircuitDefinition, CircuitState, Conductor, Device, Positions } from './types';

/** Why the lamp is on or off, in terms the UI can turn into a sentence. */
export type Diagnosis =
  | { readonly kind: 'closed' }
  | {
      readonly kind: 'open';
      /** The switch where the phase stops. */
      readonly device: Device;
      /** Terminal where the phase arrives (`a` or `b`). */
      readonly arrivesAt: string;
      /** Terminal the switch is set to. */
      readonly setTo: string;
      /** The cable that brings the phase to the switch, still live. */
      readonly liveConductor: Conductor | undefined;
    }
  | { readonly kind: 'unknown' };

const SIDES = ['a', 'b'] as const;

export function diagnose(
  circuit: CircuitDefinition,
  positions: Positions,
  state: CircuitState,
): Diagnosis {
  if (state.lampsOn.size > 0) return { kind: 'closed' };

  for (const device of circuit.devices) {
    if (device.kind !== 'combinacion') continue;
    const common = terminalOf(device.id, 'common');
    if (state.live.has(common)) continue;
    const arrivesAt = SIDES.find((side) => state.live.has(terminalOf(device.id, side)));
    if (!arrivesAt) continue;
    const terminal = terminalOf(device.id, arrivesAt);
    return {
      kind: 'open',
      device,
      arrivesAt,
      setTo: SIDES[positions[device.id] ?? 0] ?? 'a',
      liveConductor: circuit.conductors.find((c) => c.to === terminal || c.from === terminal),
    };
  }
  return { kind: 'unknown' };
}

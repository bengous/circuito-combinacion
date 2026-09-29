import type { Positions } from '@/domain/circuit';
import { demoSequence, solve } from '@/domain/circuit';
import { cableOf, type Installation, lampOf } from './installation';
import type { Finding, RuleSpec, StandardProfile } from './types';

/** Design current I_B = P / (U · cos φ), in A. */
function designCurrent(installation: Installation): number {
  const { load } = lampOf(installation);
  return load.power / (installation.voltage * load.powerFactor);
}

/**
 * Worst drop over the positions where the lamp is on, as a fraction of U, through the cables
 * that carry the current. Each conductor counts its own length: phase and neutral are two
 * conductors of the model, so the factor 2 of the textbook formula is already there.
 */
function worstDrop(
  installation: Installation,
  { resistivity, reactance }: StandardProfile['conductor'],
): { readonly drop: number; readonly positions: Positions } | null {
  const { circuit, voltage } = installation;
  const { lamp, load } = lampOf(installation);
  const cos = load.powerFactor;
  const sin = Math.sqrt(1 - cos ** 2);
  const current = designCurrent(installation);
  let worst: { drop: number; positions: Positions } | null = null;
  for (const positions of demoSequence(circuit)) {
    const state = solve(circuit, positions);
    if (!state.lampsOn.has(lamp.id)) continue;
    const impedance = circuit.conductors
      .filter((conductor) => state.current.has(conductor.id))
      .map((conductor) => cableOf(installation, conductor.id))
      .reduce(
        (sum, { section, length }) =>
          sum + ((resistivity * length) / section) * cos + reactance * length * sin,
        0,
      );
    const drop = (current * impedance) / voltage;
    if (!worst || drop > worst.drop) worst = { drop, positions };
  }
  return worst;
}

/** Drop from the main board to the lamp above the maximum. */
export function voltageDrop(
  installation: Installation,
  spec: RuleSpec<{ readonly maximum: number }>,
  profile: StandardProfile,
): Finding[] {
  const worst = worstDrop(installation, profile.conductor);
  if (!worst) return [];
  const { supply } = installation;
  const drop = (supply.board === 'sub' ? supply.upstreamDrop : 0) + worst.drop;
  return drop > spec.maximum
    ? [{ rule: 'voltage-drop', drop, maximum: spec.maximum, positions: worst.positions }]
    : [];
}

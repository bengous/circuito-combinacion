import type { Positions } from '@/domain/circuit';
import { demoSequence, solve } from '@/domain/circuit';
import { ampacityBySection } from './ampacity';
import { cableOf, type Installation, lampOf } from './installation';
import type { Finding, RuleSpec, StandardProfile } from './types';

/** Design current I_B = P / (U · cos φ), in A. */
function designCurrentOf(installation: Installation): number {
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
  const current = designCurrentOf(installation);
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

/** A conductor thinner than the minimum section. */
export function minSection(
  installation: Installation,
  spec: RuleSpec<{ readonly minimum: number }>,
): Finding[] {
  return installation.circuit.conductors.flatMap((conductor) => {
    const { section } = cableOf(installation, conductor.id);
    return section < spec.minimum
      ? [{ rule: 'min-section' as const, conductor: conductor.id, section, minimum: spec.minimum }]
      : [];
  });
}

/** The breaker trips under the normal load: I_B > I_n. */
export function breakerUnderLoad(installation: Installation): Finding[] {
  const designCurrent = designCurrentOf(installation);
  const { breaker } = installation;
  return designCurrent > breaker ? [{ rule: 'breaker-under-load', designCurrent, breaker }] : [];
}

/**
 * The breaker lets through more than the conductor can carry: I_n > I_Z. A conductor under the
 * minimum section is left out: it has its own finding, and the tables give no I_Z for it.
 */
export function cableOverBreaker(
  installation: Installation,
  _spec: RuleSpec,
  profile: StandardProfile,
): Finding[] {
  const minimum = profile.rules['min-section']?.minimum ?? 0;
  const ampacityOf = ampacityBySection(installation, profile);
  const { breaker } = installation;
  return installation.circuit.conductors.flatMap((conductor) => {
    const { section } = cableOf(installation, conductor.id);
    if (section < minimum) return [];
    const ampacity = ampacityOf(section);
    return breaker > ampacity
      ? [{ rule: 'cable-over-breaker' as const, conductor: conductor.id, breaker, ampacity }]
      : [];
  });
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

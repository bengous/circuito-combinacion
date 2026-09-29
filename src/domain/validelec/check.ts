import type { CircuitDefinition } from '@/domain/circuit';
import {
  breakerUnderLoad,
  cableOverBreaker,
  lightingBreakerCap,
  minSection,
  subBoardVoltageDrop,
  voltageDrop,
} from './dimensioning';
import { type Installation, validateInstallation } from './installation';
import { STANDARDS } from './standards';
import type { Finding, Issue, RuleSpec, StandardId, StandardProfile } from './types';
import { idleControlPoint, liveLampWhenOff, shortCircuit, switchOnNeutral } from './wiring';

type Rules = StandardProfile['rules'];
type WiringRuleId = 'switch-on-neutral' | 'live-lamp-when-off';
type DimensioningRuleId = Exclude<keyof Rules, WiringRuleId>;
type WiringRule = (circuit: CircuitDefinition) => Finding[];
type DimensioningRule<K extends DimensioningRuleId> = (
  installation: Installation,
  spec: NonNullable<Rules[K]>,
  profile: StandardProfile,
) => Finding[];

/** Rules that hold under any standard: a circuit that breaks them does not work. */
const FUNCTIONAL_RULES: readonly WiringRule[] = [shortCircuit, idleControlPoint];

/** Rules a standard sets; its profile gives their severity and clause, or null to skip them. */
const WIRING_RULES: Readonly<Record<WiringRuleId, WiringRule>> = {
  'switch-on-neutral': switchOnNeutral,
  'live-lamp-when-off': liveLampWhenOff,
};

/** Rules on the installation as built, with the threshold of the standard. */
const DIMENSIONING_RULES: { readonly [K in DimensioningRuleId]: DimensioningRule<K> } = {
  'min-section': minSection,
  'breaker-under-load': breakerUnderLoad,
  'cable-over-breaker': cableOverBreaker,
  'lighting-breaker-cap': lightingBreakerCap,
  'voltage-drop': voltageDrop,
  'sub-board-voltage-drop': subBoardVoltageDrop,
};

const issuesOf = (findings: readonly Finding[], spec: RuleSpec): Issue[] =>
  findings.map((finding) => ({ finding, severity: spec.severity, clause: spec.clause }));

function runDimensioning<K extends DimensioningRuleId>(
  id: K,
  installation: Installation,
  profile: StandardProfile,
): Issue[] {
  const spec = profile.rules[id];
  if (!spec) return [];
  return issuesOf(DIMENSIONING_RULES[id](installation, spec, profile), spec);
}

/** Every issue of the circuit under the chosen standard. Each rule runs, whatever the others find. */
export function checkCircuit(circuit: CircuitDefinition, standard: StandardId): Issue[] {
  const functional = FUNCTIONAL_RULES.flatMap((rule) => rule(circuit)).map(
    (finding): Issue => ({ finding, severity: 'error', clause: null }),
  );
  const { rules } = STANDARDS[standard];
  const wiring = (Object.keys(WIRING_RULES) as WiringRuleId[]).flatMap((id) => {
    const spec = rules[id];
    return spec ? issuesOf(WIRING_RULES[id](circuit), spec) : [];
  });
  return [...functional, ...wiring];
}

/** Every issue of the installation: its wiring, then its sizing under the chosen standard. */
export function checkInstallation(installation: Installation, standard: StandardId): Issue[] {
  validateInstallation(installation);
  const profile = STANDARDS[standard];
  const sizing = (Object.keys(DIMENSIONING_RULES) as DimensioningRuleId[]).flatMap((id) =>
    runDimensioning(id, installation, profile),
  );
  return [...checkCircuit(installation.circuit, standard), ...sizing];
}

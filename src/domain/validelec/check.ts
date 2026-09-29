import type { CircuitDefinition } from '@/domain/circuit';
import { covers } from './ampacity';
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
import { compareStandards, type Judgment } from './verdicts';
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

const STANDARD_IDS = Object.keys(STANDARDS) as StandardId[];

const judge = (findings: readonly Finding[], spec: RuleSpec): Judgment[] =>
  findings.map((finding) => ({ finding, severity: spec.severity, clause: spec.clause }));

function runDimensioning<K extends DimensioningRuleId>(
  id: K,
  installation: Installation,
  profile: StandardProfile,
): Judgment[] {
  const spec = profile.rules[id];
  if (!spec) return [];
  return judge(DIMENSIONING_RULES[id](installation, spec, profile), spec);
}

/** Every rule on the wiring, under one standard. Each rule runs, whatever the others find. */
function judgeCircuit(circuit: CircuitDefinition, profile: StandardProfile): Judgment[] {
  const functional = FUNCTIONAL_RULES.flatMap((rule) => rule(circuit)).map(
    (finding): Judgment => ({ finding, severity: 'error', clause: null }),
  );
  const wiring = (Object.keys(WIRING_RULES) as WiringRuleId[]).flatMap((id) => {
    const spec = profile.rules[id];
    return spec ? judge(WIRING_RULES[id](circuit), spec) : [];
  });
  return [...functional, ...wiring];
}

function judgeInstallation(installation: Installation, profile: StandardProfile): Judgment[] {
  const sizing = (Object.keys(DIMENSIONING_RULES) as DimensioningRuleId[]).flatMap((id) =>
    runDimensioning(id, installation, profile),
  );
  return [...judgeCircuit(installation.circuit, profile), ...sizing];
}

/** Every issue of the circuit's wiring under the chosen standard. */
export function checkCircuit(circuit: CircuitDefinition, standard: StandardId): Issue[] {
  const others = STANDARD_IDS.filter((id) => id !== standard).map(
    (id) => [id, judgeCircuit(circuit, STANDARDS[id])] as const,
  );
  return compareStandards(judgeCircuit(circuit, STANDARDS[standard]), others);
}

/**
 * Every issue of the installation, wiring then sizing, under the chosen standard. Another
 * standard is compared only when its tables cover the installation; the chosen one throws.
 */
export function checkInstallation(installation: Installation, standard: StandardId): Issue[] {
  validateInstallation(installation);
  const own = judgeInstallation(installation, STANDARDS[standard]);
  const others = STANDARD_IDS.filter(
    (id) => id !== standard && covers(STANDARDS[id], installation),
  ).map((id) => [id, judgeInstallation(installation, STANDARDS[id])] as const);
  return compareStandards(own, others);
}

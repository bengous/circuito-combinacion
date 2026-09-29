import type { CircuitDefinition } from '@/domain/circuit';
import { STANDARDS } from './standards';
import type { Finding, Issue, StandardId, StandardProfile } from './types';
import { idleControlPoint, liveLampWhenOff, shortCircuit, switchOnNeutral } from './wiring';

type Rule = (circuit: CircuitDefinition) => Finding[];
type StandardRuleId = keyof StandardProfile['rules'];

/** Rules that hold under any standard: a circuit that breaks them does not work. */
const FUNCTIONAL_RULES: readonly Rule[] = [shortCircuit, idleControlPoint];

/** Rules a standard sets; its profile gives their severity and clause, or null to skip them. */
const STANDARD_RULES: Readonly<Record<StandardRuleId, Rule>> = {
  'switch-on-neutral': switchOnNeutral,
  'live-lamp-when-off': liveLampWhenOff,
};

/** Every issue of the circuit under the chosen standard. Each rule runs, whatever the others find. */
export function checkCircuit(circuit: CircuitDefinition, standard: StandardId): Issue[] {
  const functional = FUNCTIONAL_RULES.flatMap((rule) => rule(circuit)).map(
    (finding): Issue => ({ finding, severity: 'error', clause: null }),
  );
  const { rules } = STANDARDS[standard];
  const standardIssues = (Object.keys(STANDARD_RULES) as StandardRuleId[]).flatMap((id) => {
    const spec = rules[id];
    if (!spec) return [];
    return STANDARD_RULES[id](circuit).map(
      (finding): Issue => ({ finding, severity: spec.severity, clause: spec.clause }),
    );
  });
  return [...functional, ...standardIssues];
}

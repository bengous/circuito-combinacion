import type { CircuitDefinition } from '@/domain/circuit';
import type { Issue, StandardId } from './types';
import { idleControlPoint, shortCircuit } from './wiring';

const FUNCTIONAL_RULES = [shortCircuit, idleControlPoint];

/** Every issue of the circuit under the chosen standard. Each rule runs, whatever the others find. */
export function checkCircuit(circuit: CircuitDefinition, _standard: StandardId): Issue[] {
  return FUNCTIONAL_RULES.flatMap((rule) => rule(circuit)).map((finding) => ({
    finding,
    severity: 'error',
    clause: null,
  }));
}

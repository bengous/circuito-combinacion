import type { CircuitDefinition, CircuitState, Positions } from '@/domain/circuit';
import { demoSequence, solve, toggle } from '@/domain/circuit';
import type { Finding } from './types';

/** The circuit solved in one combination of positions. */
interface Snapshot {
  readonly positions: Positions;
  readonly state: CircuitState;
}

/** Every combination of positions, in demo order, so a finding names the first one that fails. */
function snapshots(circuit: CircuitDefinition): Snapshot[] {
  return demoSequence(circuit).map((positions) => ({
    positions,
    state: solve(circuit, positions),
  }));
}

const sameLamps = (a: CircuitState, b: CircuitState) =>
  a.lampsOn.size === b.lampsOn.size && [...a.lampsOn].every((id) => b.lampsOn.has(id));

/** Phase and neutral meet on a terminal. */
export function shortCircuit(circuit: CircuitDefinition): Finding[] {
  for (const { positions, state } of snapshots(circuit)) {
    const terminals = [...state.live].filter((terminal) => state.neutral.has(terminal));
    if (terminals.length > 0) return [{ rule: 'short-circuit', positions, terminals }];
  }
  return [];
}

/** Moving the switch leaves every lamp as it was. */
export function idleControlPoint(circuit: CircuitDefinition): Finding[] {
  const all = snapshots(circuit);
  return circuit.devices.flatMap((device) => {
    const idle = all.find(({ positions, state }) =>
      sameLamps(solve(circuit, toggle(circuit, positions, device.id)), state),
    );
    return idle
      ? [{ rule: 'idle-control-point' as const, device: device.id, positions: idle.positions }]
      : [];
  });
}

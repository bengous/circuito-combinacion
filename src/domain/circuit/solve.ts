import { buildLinks, pathTo, reach } from './graph';
import type { CircuitDefinition, CircuitState, Positions } from './types';

/** Computes which terminals are live and where current flows for the given positions. */
export function solve(circuit: CircuitDefinition, positions: Positions): CircuitState {
  const links = buildLinks(circuit, positions);
  const fromPhase = reach(links, circuit.phase);
  const fromNeutral = reach(links, circuit.neutral);

  const current = new Set<string>();
  const lampsOn = new Set<string>();
  for (const lamp of circuit.lamps) {
    const forward = fromPhase.has(lamp.input) && fromNeutral.has(lamp.output);
    const backward = fromPhase.has(lamp.output) && fromNeutral.has(lamp.input);
    if (!forward && !backward) continue;
    lampsOn.add(lamp.id);
    const [phaseSide, neutralSide] = forward
      ? [lamp.input, lamp.output]
      : [lamp.output, lamp.input];
    for (const id of pathTo(fromPhase, phaseSide)) current.add(id);
    for (const id of pathTo(fromNeutral, neutralSide)) current.add(id);
  }

  return {
    live: new Set(fromPhase.keys()),
    neutral: new Set(fromNeutral.keys()),
    current,
    lampsOn,
  };
}

export type ConductorStatus = 'current' | 'live' | 'neutral' | 'dead';

/** Status of a link (conductor or contact) whose ends are `a` and `b`. */
export function linkStatus(
  state: CircuitState,
  link: { readonly id: string; readonly a: string },
): ConductorStatus {
  if (state.current.has(link.id)) return 'current';
  if (state.live.has(link.a)) return 'live';
  if (state.neutral.has(link.a)) return 'neutral';
  return 'dead';
}

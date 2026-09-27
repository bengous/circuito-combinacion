import { deviceLinks } from './devices';
import type { CircuitDefinition, Link, Positions, TerminalId } from './types';

/** All conducting links for the given positions. Lamps are not links: current must cross them. */
export function buildLinks(circuit: CircuitDefinition, positions: Positions): Link[] {
  const conductors = circuit.conductors.map(({ id, from, to }) => ({ id, a: from, b: to }));
  const contacts = circuit.devices.flatMap((device) =>
    deviceLinks(device, positions[device.id] ?? 0),
  );
  return [...conductors, ...contacts];
}

/** How a terminal was reached during a search: previous terminal and the link used. */
export interface Step {
  readonly from: TerminalId;
  readonly linkId: string;
}

/** Breadth-first search. Returns every reachable terminal with the step that reached it. */
export function reach(links: readonly Link[], start: TerminalId): Map<TerminalId, Step | null> {
  const neighbours = new Map<TerminalId, Array<{ to: TerminalId; linkId: string }>>();
  const connect = (from: TerminalId, to: TerminalId, linkId: string) => {
    const list = neighbours.get(from) ?? [];
    list.push({ to, linkId });
    neighbours.set(from, list);
  };
  for (const link of links) {
    connect(link.a, link.b, link.id);
    connect(link.b, link.a, link.id);
  }

  const visited = new Map<TerminalId, Step | null>([[start, null]]);
  const queue: TerminalId[] = [start];
  for (let terminal = queue.shift(); terminal !== undefined; terminal = queue.shift()) {
    for (const { to, linkId } of neighbours.get(terminal) ?? []) {
      if (!visited.has(to)) {
        visited.set(to, { from: terminal, linkId });
        queue.push(to);
      }
    }
  }
  return visited;
}

/** Link ids on the path from the search start to `target`. */
export function pathTo(visited: Map<TerminalId, Step | null>, target: TerminalId): string[] {
  const ids: string[] = [];
  for (let step = visited.get(target); step; step = visited.get(step.from)) {
    ids.push(step.linkId);
  }
  return ids;
}

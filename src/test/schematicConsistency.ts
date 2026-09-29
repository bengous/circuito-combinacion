// Checks that a schematic geometry draws the circuit the electrical model describes.
import type { CircuitDefinition, TerminalId } from '@/domain/circuit';
import { DEVICE_KINDS, terminalOf } from '@/domain/circuit';
import type { Point, SchematicGeometry } from '@/features/schematic/geometry/types';

const SAME_POINT = 1e-6;

function modelTerminals(circuit: CircuitDefinition): TerminalId[] {
  return [
    circuit.phase,
    circuit.neutral,
    ...circuit.devices.flatMap((device) =>
      DEVICE_KINDS[device.kind].terminals.map((name) => terminalOf(device.id, name)),
    ),
    ...circuit.lamps.flatMap((lamp) => [lamp.input, lamp.output]),
  ];
}

const samePoint = (p: Point, q: Point) =>
  Math.abs(p.x - q.x) < SAME_POINT && Math.abs(p.y - q.y) < SAME_POINT;

/** Terminals of the model that the drawing does not place. */
export function unplacedTerminals(
  circuit: CircuitDefinition,
  geometry: SchematicGeometry,
): TerminalId[] {
  return modelTerminals(circuit).filter((terminal) => !geometry.terminals.has(terminal));
}

/** Terminals drawn on the same point as another one: on screen, they look joined. */
export function collidingTerminals(geometry: SchematicGeometry): TerminalId[] {
  const placed = [...geometry.terminals];
  return placed
    .filter(([id, point]) => placed.some(([other, q]) => other !== id && samePoint(point, q)))
    .map(([id]) => id);
}

/** Bridge letters written on the drawing that differ from the bridge names of the model. */
export function bridgeLetterMismatches(
  circuit: CircuitDefinition,
  geometry: SchematicGeometry,
): ReadonlyArray<{ readonly drawn: string; readonly named: string }> {
  const named = circuit.conductors
    .filter((conductor) => conductor.role === 'bridge')
    .map((conductor) => conductor.label.split(' ').at(-1) ?? '');
  const drawn = geometry.bridgeLabels.map((mark) => mark.text);
  return Array.from({ length: Math.max(named.length, drawn.length) }, (_, i) => ({
    drawn: drawn[i] ?? '',
    named: named[i] ?? '',
  })).filter((pair) => pair.drawn !== pair.named);
}

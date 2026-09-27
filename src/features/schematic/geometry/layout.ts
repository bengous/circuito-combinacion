import type { CircuitDefinition } from '@/domain/circuit';
import { layoutChain } from './chainLayout';
import type { Point, SchematicGeometry } from './types';

/** Picks the layout strategy declared by the circuit. */
export function layoutCircuit(circuit: CircuitDefinition): SchematicGeometry {
  switch (circuit.layout.type) {
    case 'chain':
      return layoutChain(circuit);
  }
}

export function pointOf(geometry: SchematicGeometry, terminal: string): Point {
  const point = geometry.terminals.get(terminal);
  if (!point) throw new Error(`No position for terminal "${terminal}"`);
  return point;
}

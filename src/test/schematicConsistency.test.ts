import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import type { TerminalId } from '@/domain/circuit';
import { layoutCircuit, pointOf } from '@/features/schematic/geometry/layout';
import type { Point, SchematicGeometry } from '@/features/schematic/geometry/types';
import {
  bridgeLetterMismatches,
  collidingTerminals,
  unplacedTerminals,
} from './schematicConsistency';

const geometry = layoutCircuit(combinacionSimple);

function withTerminals(change: (terminals: Map<TerminalId, Point>) => void): SchematicGeometry {
  const terminals = new Map(geometry.terminals);
  change(terminals);
  return { ...geometry, terminals };
}

describe('schematic consistency predicates', () => {
  it('find a terminal the drawing does not place', () => {
    const broken = withTerminals((terminals) => terminals.delete('llave1.a'));
    expect(unplacedTerminals(combinacionSimple, broken)).toEqual(['llave1.a']);
  });

  it('find two terminals drawn on the same point', () => {
    const point = pointOf(geometry, 'llave1.a');
    const broken = withTerminals((terminals) => terminals.set('llave1.b', point));
    expect(collidingTerminals(broken)).toEqual(['llave1.a', 'llave1.b']);
  });

  it('find swapped bridge letters', () => {
    const broken = { ...geometry, bridgeLabels: [...geometry.bridgeLabels].reverse() };
    expect(bridgeLetterMismatches(combinacionSimple, broken)).toEqual([
      { drawn: 'B', named: 'A' },
      { drawn: 'A', named: 'B' },
    ]);
  });
});

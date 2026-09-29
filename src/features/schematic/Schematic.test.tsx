import { render } from '@testing-library/react';
import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import { solve } from '@/domain/circuit';
import { layoutCircuit, pointOf } from './geometry/layout';
import { Schematic } from './Schematic';

// Llave 1 on A, Llave 2 on B: the lamp is off, bridge A is live, bridge B and the return are dead.
const positions = { llave1: 0, llave2: 1 };
const geometry = layoutCircuit(combinacionSimple);

function wireOf(conductorId: string): Element {
  const { container } = render(
    <Schematic
      circuit={combinacionSimple}
      positions={positions}
      state={solve(combinacionSimple, positions)}
      showTension
      highlightedDevice={null}
      onToggle={() => {}}
    />,
  );
  const wire = container.querySelector(`[data-conductor="${conductorId}"]`);
  if (!wire) throw new Error(`No wire drawn for conductor "${conductorId}"`);
  return wire;
}

describe('Schematic wires', () => {
  it.each(combinacionSimple.conductors.map((c) => [c.id, c] as const))(
    'draws %s from its first terminal to its second',
    (id, conductor) => {
      const path = wireOf(id).getAttribute('d') ?? '';
      const ends = (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
      const from = pointOf(geometry, conductor.from);
      const to = pointOf(geometry, conductor.to);
      expect(ends).toEqual([from.x, from.y, to.x, to.y].map((n) => expect.closeTo(n, 6)));
    },
  );

  it.each([
    ['fase', 'phase'],
    ['puente-1-a', 'phase'],
    ['puente-1-b', 'dead'],
    ['retorno', 'dead'],
    ['neutro', 'neutral'],
  ])('paints %s in the %s tone', (id, tone) => {
    expect(wireOf(id)).toHaveAttribute('data-tone', tone);
  });
});

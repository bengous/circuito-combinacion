import { CATALOG } from '@/domain/catalog';
import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import type { CircuitDefinition, Positions } from '@/domain/circuit';
import { demoSequence, initialPositions, linkStatus, solve } from '@/domain/circuit';

const statusOf = (circuit: CircuitDefinition, positions: Positions, conductorId: string) => {
  const conductor = circuit.conductors.find((c) => c.id === conductorId);
  if (!conductor) throw new Error(`No conductor ${conductorId}`);
  return linkStatus(solve(circuit, positions), { id: conductor.id, a: conductor.from });
};

describe('solve', () => {
  describe.each(CATALOG.map((c) => [c.id, c] as const))('%s', (_, circuit) => {
    // In a multi-point circuit, every switch flips the lamp: it is on when an even
    // number of switches have left their rest position.
    it.each(demoSequence(circuit).map((p) => [JSON.stringify(p), p] as const))(
      'lamp follows the parity of the switches for %s',
      (_, positions) => {
        const moved = Object.values(positions).filter((p) => p !== 0).length;
        expect(solve(circuit, positions).lampsOn.has('lampara')).toBe(moved % 2 === 0);
      },
    );

    it('carries current through phase, return and neutral when the lamp is on', () => {
      const positions = initialPositions(circuit);
      for (const id of ['fase', 'retorno', 'neutro']) {
        expect(statusOf(circuit, positions, id)).toBe('current');
      }
    });
  });

  describe('combinación simple, Llave 1 on A and Llave 2 on B', () => {
    const positions = { llave1: 0, llave2: 1 };

    it('turns the lamp off', () => {
      expect(solve(combinacionSimple, positions).lampsOn.size).toBe(0);
    });

    it('keeps bridge A live but without current', () => {
      expect(statusOf(combinacionSimple, positions, 'puente-1-a')).toBe('live');
      expect(statusOf(combinacionSimple, positions, 'fase')).toBe('live');
    });

    it('leaves bridge B and the return dead', () => {
      expect(statusOf(combinacionSimple, positions, 'puente-1-b')).toBe('dead');
      expect(statusOf(combinacionSimple, positions, 'retorno')).toBe('dead');
    });

    it('keeps the neutral connected', () => {
      expect(statusOf(combinacionSimple, positions, 'neutro')).toBe('neutral');
    });
  });
});

import { combinacionConCruce } from '@/domain/catalog/combinacion-con-cruce';
import type { Positions } from '@/domain/circuit';
import { diagnose, initialPositions, solve } from '@/domain/circuit';

const run = (positions: Positions) =>
  diagnose(combinacionConCruce, positions, solve(combinacionConCruce, positions));

describe('diagnose', () => {
  it('reports a closed circuit when the lamp is on', () => {
    expect(run(initialPositions(combinacionConCruce))).toEqual({ kind: 'closed' });
  });

  it('finds where the phase stops when the cruce is crossed', () => {
    const diagnosis = run({ llave1: 0, cruce: 1, llave2: 0 });
    expect(diagnosis).toMatchObject({
      kind: 'open',
      device: { id: 'llave2' },
      arrivesAt: 'b',
      setTo: 'a',
      liveConductor: { id: 'puente-2-b' },
    });
  });
});

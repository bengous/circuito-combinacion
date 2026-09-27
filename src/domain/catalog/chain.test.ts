import { defineChainCircuit } from './chain';

describe('defineChainCircuit', () => {
  it('links consecutive stages with two bridges', () => {
    const circuit = defineChainCircuit({
      id: 'test',
      title: 'Test',
      stages: [
        { id: 's1', kind: 'combinacion', name: 'S1' },
        { id: 'x', kind: 'cruce', name: 'X' },
        { id: 's2', kind: 'combinacion', name: 'S2' },
      ],
    });
    const bridges = circuit.conductors.filter((c) => c.role === 'bridge');
    expect(bridges.map((c) => [c.from, c.to])).toEqual([
      ['s1.a', 'x.inA'],
      ['s1.b', 'x.inB'],
      ['x.outA', 's2.a'],
      ['x.outB', 's2.b'],
    ]);
    expect(circuit.pointsOfControl).toBe(3);
  });

  it.each([
    ['a cruce at an end', ['cruce', 'combinacion']],
    ['a combinacion in the middle', ['combinacion', 'combinacion', 'combinacion']],
    ['a single stage', ['combinacion']],
  ] as const)('rejects %s', (_, kinds) => {
    const stages = kinds.map((kind, i) => ({ id: `s${i}`, kind, name: `S${i}` }));
    expect(() => defineChainCircuit({ id: 'bad', title: 'Bad', stages })).toThrow(/chain/);
  });
});

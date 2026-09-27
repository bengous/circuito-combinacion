import { CATALOG } from '@/domain/catalog';
import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import { demoSequence, initialPositions, toggle } from '@/domain/circuit';

describe('toggle', () => {
  it('moves only the chosen device, and back', () => {
    const start = initialPositions(combinacionSimple);
    const once = toggle(combinacionSimple, start, 'llave2');
    expect(once).toEqual({ llave1: 0, llave2: 1 });
    expect(toggle(combinacionSimple, once, 'llave2')).toEqual(start);
  });

  it('rejects an unknown device', () => {
    expect(() => toggle(combinacionSimple, {}, 'nope')).toThrow(/Unknown device/);
  });
});

describe.each(CATALOG.map((c) => [c.id, c] as const))('demoSequence for %s', (_, circuit) => {
  const sequence = demoSequence(circuit);

  it('visits every combination once, starting at rest', () => {
    expect(sequence).toHaveLength(2 ** circuit.devices.length);
    expect(new Set(sequence.map((p) => JSON.stringify(p))).size).toBe(sequence.length);
    expect(sequence[0]).toEqual(initialPositions(circuit));
  });

  it('moves a single switch between two steps', () => {
    sequence.forEach((positions, i) => {
      const next = sequence[(i + 1) % sequence.length] ?? positions;
      const moved = circuit.devices.filter((d) => positions[d.id] !== next[d.id]);
      expect(moved).toHaveLength(1);
    });
  });
});

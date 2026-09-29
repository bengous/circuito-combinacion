import { CATALOG } from '@/domain/catalog';
import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import {
  bridgeLetterMismatches,
  collidingTerminals,
  unplacedTerminals,
} from '@/test/schematicConsistency';
import { layoutCircuit } from './layout';

it('refuses a circuit with a second lamp, which the chain cannot draw', () => {
  const twoLamps = {
    ...combinacionSimple,
    lamps: [...combinacionSimple.lamps, { id: 'lampara2', input: 'l2.in', output: 'l2.out' }],
  };
  expect(() => layoutCircuit(twoLamps)).toThrow(/draws one lamp, found 2/);
});

describe.each(CATALOG.map((c) => [c.id, c] as const))('layout of %s', (_, circuit) => {
  const geometry = layoutCircuit(circuit);

  it('places every terminal a conductor touches', () => {
    for (const conductor of circuit.conductors) {
      expect(geometry.terminals.has(conductor.from)).toBe(true);
      expect(geometry.terminals.has(conductor.to)).toBe(true);
    }
  });

  it('keeps everything inside the drawing', () => {
    for (const point of geometry.terminals.values()) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(geometry.width);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(geometry.height);
    }
  });

  it('gives every device a body and a label', () => {
    expect([...geometry.devices.keys()]).toEqual(circuit.devices.map((d) => d.id));
  });

  it('places every terminal of the model', () => {
    expect(unplacedTerminals(circuit, geometry)).toEqual([]);
  });

  it('never draws two terminals on the same point', () => {
    expect(collidingTerminals(geometry)).toEqual([]);
  });

  it('writes the bridge letters the model names', () => {
    expect(bridgeLetterMismatches(circuit, geometry)).toEqual([]);
  });
});

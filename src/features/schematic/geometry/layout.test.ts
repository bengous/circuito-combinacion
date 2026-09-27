import { CATALOG } from '@/domain/catalog';
import { layoutCircuit } from './layout';

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
});

import { CATALOG } from '@/domain/catalog';
import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import type { CircuitDefinition, Conductor } from '@/domain/circuit';
import {
  checkCircuit,
  type Finding,
  type Issue,
  STANDARDS,
  type StandardId,
} from '@/domain/validelec';

const standards = Object.keys(STANDARDS) as StandardId[];
const rest = { llave1: 0, llave2: 0 };
const firstOff = { llave1: 1, llave2: 0 };

const CLAUSES: Readonly<Record<StandardId, { readonly neutral: string; readonly lamp: string }>> = {
  aea: { neutral: '90364-6-61, 613.8', lamp: '90364-6-61, 613.8' },
  iec: { neutral: '60364-5-53:2019, 530.4.2', lamp: '60364-6, 6.4.3.6' },
};

const withCable = (cable: Conductor): CircuitDefinition => ({
  ...combinacionSimple,
  conductors: [...combinacionSimple.conductors, cable],
});

/** A cable from the phase straight to the neutral. */
const shortCircuited = withCable({
  id: 'falla',
  from: 'L',
  to: 'N',
  role: 'phase',
  label: 'falla',
});

/** Bridge A joined to bridge B at Llave 1: both bridges are always live. */
const bridgedBridges = withCable({
  id: 'puente-ab',
  from: 'llave1.a',
  to: 'llave1.b',
  role: 'bridge',
  label: 'puente AB',
});

/** The lamp takes the phase and the switches break the neutral. */
const cutNeutral: CircuitDefinition = {
  ...combinacionSimple,
  conductors: [
    { id: 'fase', from: 'L', to: 'lampara.in', role: 'phase', label: 'fase' },
    ...combinacionSimple.conductors.filter((c) => c.role === 'bridge'),
    { id: 'retorno', from: 'lampara.out', to: 'llave1.common', role: 'return', label: 'retorno' },
    { id: 'neutro', from: 'llave2.common', to: 'N', role: 'neutral', label: 'neutro' },
  ],
};

const functional = (finding: Finding): Issue => ({ finding, severity: 'error', clause: null });

describe.each(standards)('checkCircuit with the %s standard', (standard) => {
  const onNeutral = (device: string): Issue => ({
    finding: { rule: 'switch-on-neutral', device, positions: rest },
    severity: 'error',
    clause: CLAUSES[standard].neutral,
  });
  const liveLamp: Issue = {
    finding: { rule: 'live-lamp-when-off', lamp: 'lampara', positions: firstOff },
    severity: 'error',
    clause: CLAUSES[standard].lamp,
  };

  it.each(CATALOG.map((c) => [c.id, c] as const))('finds nothing wrong in %s', (_, circuit) => {
    expect(checkCircuit(circuit, standard)).toEqual([]);
  });

  it('finds the short circuit of a cable from L to N, and the neutral it spreads', () => {
    expect(checkCircuit(shortCircuited, standard)).toEqual([
      functional({
        rule: 'short-circuit',
        positions: rest,
        terminals: expect.arrayContaining(['L', 'N']),
      }),
      onNeutral('llave1'),
      onNeutral('llave2'),
      liveLamp,
    ]);
  });

  it('finds both switches idle when bridge A is joined to bridge B', () => {
    expect(checkCircuit(bridgedBridges, standard)).toEqual([
      functional({ rule: 'idle-control-point', device: 'llave1', positions: rest }),
      functional({ rule: 'idle-control-point', device: 'llave2', positions: rest }),
    ]);
  });

  it('finds the switches on the neutral and the live lamp when the lamp takes the phase', () => {
    expect(checkCircuit(cutNeutral, standard)).toEqual([
      onNeutral('llave1'),
      onNeutral('llave2'),
      liveLamp,
    ]);
  });
});

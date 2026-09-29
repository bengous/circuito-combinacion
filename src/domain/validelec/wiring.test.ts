import { CATALOG } from '@/domain/catalog';
import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import type { CircuitDefinition, Conductor } from '@/domain/circuit';
import { checkCircuit, type Finding, STANDARDS, type StandardId } from '@/domain/validelec';

const standards = Object.keys(STANDARDS) as StandardId[];
const rest = { llave1: 0, llave2: 0 };

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

const findings = (circuit: CircuitDefinition, standard: StandardId, rule: Finding['rule']) =>
  checkCircuit(circuit, standard).filter((issue) => issue.finding.rule === rule);

describe.each(standards)('checkCircuit with the %s standard', (standard) => {
  it.each(CATALOG.map((c) => [c.id, c] as const))('finds nothing wrong in %s', (_, circuit) => {
    expect(checkCircuit(circuit, standard)).toEqual([]);
  });

  it('finds the short circuit of a cable from L to N', () => {
    expect(findings(shortCircuited, standard, 'short-circuit')).toEqual([
      {
        finding: {
          rule: 'short-circuit',
          positions: rest,
          terminals: expect.arrayContaining(['L', 'N']),
        },
        severity: 'error',
        clause: null,
      },
    ]);
  });

  it('finds both switches idle when bridge A is joined to bridge B', () => {
    expect(findings(bridgedBridges, standard, 'idle-control-point')).toEqual(
      ['llave1', 'llave2'].map((device) => ({
        finding: { rule: 'idle-control-point', device, positions: rest },
        severity: 'error',
        clause: null,
      })),
    );
  });
});

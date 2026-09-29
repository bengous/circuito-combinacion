import {
  checkInstallation,
  type Installation,
  type Issue,
  STANDARDS,
  type StandardId,
} from '@/domain/validelec';
import { bigBreaker, cables, longLine, SHORT_RUNS, sound, subBoard } from '@/test/installations';

const standards = Object.keys(STANDARDS) as StandardId[];
const bothLit = { llave1: 1, llave2: 1 };

/** What the chosen standard says, without the comparison with the other standards. */
const judged = (issues: readonly Issue[]) =>
  issues
    .filter((issue) => issue.severity !== 'info')
    .map(({ finding, severity, clause }) => ({ finding, severity, clause }));

describe.each(standards)('checkInstallation with the %s standard', (standard) => {
  it('finds nothing wrong with short 1,5 mm² cables behind a 10 A breaker', () => {
    expect(checkInstallation(sound, standard)).toEqual([]);
  });
});

describe('voltage drop', () => {
  it.each([
    ['aea', 'error', '771.13 b)'],
    ['iec', 'warning', '60364-5-52, G.52.1'],
  ] as const)(
    'reports the worst lit position of a long line under %s',
    (standard, severity, clause) => {
      // Through bridge B: 130 m, R = 0,0225 × 130 / 1,5 = 1,95 Ω, I = 1000 / 220 A, 8,86 V.
      expect(judged(checkInstallation(longLine, standard))).toEqual([
        {
          finding: {
            rule: 'voltage-drop',
            drop: expect.closeTo(0.040289, 6),
            maximum: 0.03,
            positions: bothLit,
          },
          severity,
          clause,
        },
      ]);
    },
  );

  it('counts the power factor in the current and the reactance of the cables', () => {
    const lamp = { power: 1000, powerFactor: 0.8 };
    const issues = checkInstallation({ ...longLine, loads: { lampara: lamp } }, 'iec');
    // I = 1000 / (220 × 0,8) A; ΔU = I × (1,95 × 0,8 + 0,00008 × 130 × 0,6) = 8,90 V.
    expect(issues.map((issue) => issue.finding)).toEqual([
      { rule: 'voltage-drop', drop: expect.closeTo(0.04045, 5), maximum: 0.03, positions: bothLit },
    ]);
  });
});

describe('sections and breaker', () => {
  const minSection = { aea: '771.13, Tabla 771.13.I', iec: '60364-5-52, 524.1' } as const;
  const coordination = { aea: '771.19.2.1', iec: '60364-4-43:2023, 431.4.2' } as const;

  it.each(standards)('reports a 1 mm² bridge under %s, and nothing else', (standard) => {
    const thin = { ...sound.cables, 'puente-1-b': { section: 1, length: 4 } };
    expect(judged(checkInstallation({ ...sound, cables: thin }, standard))).toEqual([
      {
        finding: { rule: 'min-section', conductor: 'puente-1-b', section: 1, minimum: 1.5 },
        severity: 'error',
        clause: minSection[standard],
      },
    ]);
  });

  it.each([
    ['aea', 15],
    ['iec', 15.225],
  ] as const)('reports a 1,5 mm² return behind 16 A at 40 °C under %s', (standard, ampacity) => {
    // AEA: 15 A at 40 °C. IEC: 17,5 A at 30 °C × 0,87. The 2,5 mm² cables carry 21 and 20,88 A.
    const weakReturn: Installation = {
      ...sound,
      ambient: 40,
      breaker: 16,
      cables: { ...cables(SHORT_RUNS, 2.5), retorno: { section: 1.5, length: 3 } },
    };
    expect(judged(checkInstallation(weakReturn, standard))).toEqual([
      {
        finding: {
          rule: 'cable-over-breaker',
          conductor: 'retorno',
          breaker: 16,
          ampacity: expect.closeTo(ampacity, 6),
        },
        severity: 'error',
        clause: coordination[standard],
      },
    ]);
  });

  it.each(standards)('reports a 2000 W lamp behind a 6 A breaker under %s', (standard) => {
    const strong = { ...sound, breaker: 6, loads: { lampara: { power: 2000, powerFactor: 1 } } };
    expect(judged(checkInstallation(strong, standard))).toEqual([
      {
        finding: {
          rule: 'breaker-under-load',
          designCurrent: expect.closeTo(9.0909, 4),
          breaker: 6,
        },
        severity: 'error',
        clause: coordination[standard],
      },
    ]);
  });

  it('applies the IEC grouping factor to every cable of a conduit with 4 circuits', () => {
    const crowded = { ...sound, breaker: 13, circuitsInConduit: 4 };
    expect(checkInstallation(crowded, 'iec').map((issue) => issue.finding)).toEqual(
      sound.circuit.conductors.map((conductor) => ({
        rule: 'cable-over-breaker',
        conductor: conductor.id,
        breaker: 13,
        ampacity: expect.closeTo(11.375, 6),
      })),
    );
  });

  it('has no AEA grouping factor for 4 circuits in one conduit', () => {
    expect(() => checkInstallation({ ...sound, circuitsInConduit: 4 }, 'aea')).toThrow(
      'AEA: no grouping factor for 4 circuits in one conduit',
    );
  });

  it.each(standards)('has no %s temperature factor for 42 °C', (standard) => {
    expect(() => checkInstallation({ ...sound, ambient: 42 }, standard)).toThrow(
      /no temperature factor for 42 °C/,
    );
  });
});

describe('lighting breaker cap and sub-board', () => {
  it('caps a lighting breaker at 16 A under the AEA only', () => {
    expect(judged(checkInstallation(bigBreaker, 'aea'))).toEqual([
      {
        finding: { rule: 'lighting-breaker-cap', breaker: 20, maximum: 16 },
        severity: 'error',
        clause: '771.7.6 a) I',
      },
    ]);
    expect(judged(checkInstallation(bigBreaker, 'iec'))).toEqual([]);
  });

  // Through bridge B: 80 m, R = 1,2 Ω, ΔU = 5,45 V, 2,48 % after the sub-board, 3,48 % in all.
  const total = { drop: expect.closeTo(0.034793, 6), maximum: 0.03, positions: bothLit };
  const afterSubBoard = { drop: expect.closeTo(0.024793, 6), maximum: 0.02, positions: bothLit };

  it('adds the drop upstream of a sub-board, and recommends 2 % after it, under the AEA', () => {
    expect(judged(checkInstallation(subBoard, 'aea'))).toEqual([
      { finding: { rule: 'voltage-drop', ...total }, severity: 'error', clause: '771.13 b)' },
      {
        finding: { rule: 'sub-board-voltage-drop', ...afterSubBoard },
        severity: 'warning',
        clause: '771.13 b), nota',
      },
    ]);
  });

  it('adds the drop upstream of a sub-board under the IEC, with no limit after it', () => {
    expect(judged(checkInstallation(subBoard, 'iec'))).toEqual([
      {
        finding: { rule: 'voltage-drop', ...total },
        severity: 'warning',
        clause: '60364-5-52, G.52.1',
      },
    ]);
  });
});

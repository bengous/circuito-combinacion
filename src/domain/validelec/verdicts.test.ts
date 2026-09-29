import { checkInstallation, type Installation } from '@/domain/validelec';
import { bigBreaker, cables, longLine, SHORT_RUNS, sound, subBoard } from '@/test/installations';

const bothLit = { llave1: 1, llave2: 1 };
const drop = (value: number) => expect.closeTo(value, 6);

describe('the other standard', () => {
  it('shows a stricter severity for the same drop', () => {
    const finding = {
      rule: 'voltage-drop',
      drop: drop(0.040289),
      maximum: 0.03,
      positions: bothLit,
    };
    expect(checkInstallation(longLine, 'aea')).toEqual([
      {
        finding,
        severity: 'error',
        clause: '771.13 b)',
        elsewhere: [{ standard: 'iec', severity: 'warning', clause: '60364-5-52, G.52.1' }],
      },
    ]);
    expect(checkInstallation(longLine, 'iec')).toEqual([
      {
        finding,
        severity: 'warning',
        clause: '60364-5-52, G.52.1',
        elsewhere: [{ standard: 'aea', severity: 'error', clause: '771.13 b)' }],
      },
    ]);
  });

  it('turns a rule the chosen standard lacks into info, and says the other has no such rule', () => {
    const cap = { rule: 'lighting-breaker-cap', breaker: 20, maximum: 16 };
    expect(checkInstallation(bigBreaker, 'iec')).toEqual([
      {
        finding: cap,
        severity: 'info',
        clause: null,
        elsewhere: [{ standard: 'aea', severity: 'error', clause: '771.7.6 a) I' }],
      },
    ]);
    expect(checkInstallation(bigBreaker, 'aea')).toEqual([
      {
        finding: cap,
        severity: 'error',
        clause: '771.7.6 a) I',
        elsewhere: [{ standard: 'iec', severity: null, clause: null }],
      },
    ]);
  });

  it('lists the drops of a sub-board circuit under the IEC, then the AEA recommendation', () => {
    expect(checkInstallation(subBoard, 'iec')).toEqual([
      {
        finding: { rule: 'voltage-drop', drop: drop(0.034793), maximum: 0.03, positions: bothLit },
        severity: 'warning',
        clause: '60364-5-52, G.52.1',
        elsewhere: [{ standard: 'aea', severity: 'error', clause: '771.13 b)' }],
      },
      {
        finding: {
          rule: 'sub-board-voltage-drop',
          drop: drop(0.024793),
          maximum: 0.02,
          positions: bothLit,
        },
        severity: 'info',
        clause: null,
        elsewhere: [{ standard: 'aea', severity: 'warning', clause: '771.13 b), nota' }],
      },
    ]);
  });

  it('shows a clause the other standard passes', () => {
    // 10 mm² at 40 °C: AEA 50 A holds a 50 A breaker, IEC 57 × 0,87 = 49,59 A does not.
    const heavy: Installation = {
      ...sound,
      ambient: 40,
      breaker: 50,
      cables: cables(SHORT_RUNS, 10),
    };
    const passes = { standard: 'aea', severity: null, clause: '771.19.2.1' };
    expect(checkInstallation(heavy, 'iec')).toEqual([
      ...sound.circuit.conductors.map((conductor) => ({
        finding: {
          rule: 'cable-over-breaker',
          conductor: conductor.id,
          breaker: 50,
          ampacity: expect.closeTo(49.59, 6),
        },
        severity: 'error',
        clause: '60364-4-43:2023, 431.4.2',
        elsewhere: [passes],
      })),
      {
        finding: { rule: 'lighting-breaker-cap', breaker: 50, maximum: 16 },
        severity: 'info',
        clause: null,
        elsewhere: [{ standard: 'aea', severity: 'error', clause: '771.7.6 a) I' }],
      },
    ]);
  });

  it('leaves out a standard whose tables do not cover the installation', () => {
    // The AEA grouping table stops at 3 circuits; the IEC gives 17,5 × 0,65 = 11,375 A.
    const crowded = { ...sound, breaker: 13, circuitsInConduit: 4 };
    const issues = checkInstallation(crowded, 'iec');
    expect(issues).toHaveLength(sound.circuit.conductors.length);
    expect(issues.map((issue) => issue.elsewhere)).toEqual(issues.map(() => []));
  });
});

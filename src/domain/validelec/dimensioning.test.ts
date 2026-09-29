import { checkInstallation, type Issue, STANDARDS, type StandardId } from '@/domain/validelec';
import { longLine, sound } from '@/test/installations';

const standards = Object.keys(STANDARDS) as StandardId[];
const bothLit = { llave1: 1, llave2: 1 };

/** What the chosen standard says, without the comparison with the other standards. */
const judged = (issues: readonly Issue[]) =>
  issues.map(({ finding, severity, clause }) => ({ finding, severity, clause }));

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

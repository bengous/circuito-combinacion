import type { StandardProfile } from './types';

/** IEC 60364, the international rules for low-voltage installations. */
export const IEC: StandardProfile = {
  id: 'iec',
  rules: {
    'switch-on-neutral': { severity: 'error', clause: '60364-5-53:2019, 530.4.2' },
    'live-lamp-when-off': { severity: 'error', clause: '60364-6, 6.4.3.6' },
    'min-section': { severity: 'error', clause: '60364-5-52, 524.1', minimum: 1.5 },
    'breaker-under-load': { severity: 'error', clause: '60364-4-43:2023, 431.4.2' },
    'cable-over-breaker': { severity: 'error', clause: '60364-4-43:2023, 431.4.2' },
    // Annex G is informative and clause 525 says "should".
    'voltage-drop': { severity: 'warning', clause: '60364-5-52, G.52.1', maximum: 0.03 },
  },
  ampacity: {
    // 60364-5-52 Table B.52.2, PVC, two loaded conductors, method B1 (column 4), at 30 °C.
    base: {
      1.5: 17.5,
      2.5: 24,
      4: 32,
      6: 41,
      10: 57,
      16: 76,
      25: 101,
      35: 125,
      50: 151,
      70: 192,
      95: 232,
      120: 269,
      150: 300,
      185: 341,
      240: 400,
      300: 458,
    },
    // Table B.52.14, PVC, cables in air.
    temperature: {
      10: 1.22,
      15: 1.17,
      20: 1.12,
      25: 1.06,
      30: 1,
      35: 0.94,
      40: 0.87,
      45: 0.79,
      50: 0.71,
      55: 0.61,
      60: 0.5,
    },
    // Table B.52.17, item 1: bunched in air, on a surface, embedded or enclosed.
    grouping: {
      1: 1,
      2: 0.8,
      3: 0.7,
      4: 0.65,
      5: 0.6,
      6: 0.57,
      7: 0.54,
      8: 0.52,
      9: 0.5,
      12: 0.45,
      16: 0.41,
      20: 0.38,
    },
  },
  // 60364-5-52 Annex G: ρ1 = 1,25 × ρ at 20 °C for copper; λ = 0,08 mΩ/m.
  conductor: { resistivity: 0.0225, reactance: 0.00008 },
};

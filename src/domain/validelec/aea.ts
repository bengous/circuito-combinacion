import { IEC } from './iec';
import type { StandardProfile } from './types';

/** AEA 90364, the Argentine rules: part 6-61 (verification) and part 7-771 (dwellings). */
export const AEA: StandardProfile = {
  id: 'aea',
  rules: {
    'switch-on-neutral': { severity: 'error', clause: '90364-6-61, 613.8' },
    'live-lamp-when-off': { severity: 'error', clause: '90364-6-61, 613.8' },
    'min-section': { severity: 'error', clause: '771.13, Tabla 771.13.I', minimum: 1.5 },
    'breaker-under-load': { severity: 'error', clause: '771.19.2.1' },
    'cable-over-breaker': { severity: 'error', clause: '771.19.2.1' },
    'lighting-breaker-cap': { severity: 'error', clause: '771.7.6 a) I', maximum: 16 },
    'voltage-drop': { severity: 'error', clause: '771.13 b)', maximum: 0.03 },
    // The note says "se recomienda" 1 % upstream, hence 2 % from the sub-board.
    'sub-board-voltage-drop': { severity: 'warning', clause: '771.13 b), nota', maximum: 0.02 },
  },
  ampacity: {
    // Tabla 771.16.I, column 2x (two loaded conductors + PE), at 40 °C.
    base: {
      1.5: 15,
      2.5: 21,
      4: 28,
      6: 36,
      10: 50,
      16: 66,
      25: 88,
      35: 109,
      50: 131,
      70: 167,
      95: 202,
      120: 234,
      150: 261,
      185: 297,
      240: 348,
      300: 398,
    },
    // Tabla 771.16.II.a, PVC.
    temperature: {
      10: 1.4,
      15: 1.34,
      20: 1.29,
      25: 1.22,
      30: 1.15,
      35: 1.08,
      40: 1,
      45: 0.91,
      50: 0.82,
      55: 0.7,
      60: 0.57,
    },
    // Tabla 771.16.II.b, single-phase circuits; 771.16.2.2 b) applies it to more than one circuit.
    grouping: { 1: 1, 2: 0.8, 3: 0.7 },
  },
  // 771.19.7 a) gives the formula of IEC 60364-5-52 Annex G without its constants: it refers
  // to the manufacturer or to IEC 60287. See ADR 0006.
  conductor: IEC.conductor,
};

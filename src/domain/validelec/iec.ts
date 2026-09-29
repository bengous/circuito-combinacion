import type { StandardProfile } from './types';

/** IEC 60364, the international rules for low-voltage installations. */
export const IEC: StandardProfile = {
  id: 'iec',
  rules: {
    'switch-on-neutral': { severity: 'error', clause: '60364-5-53:2019, 530.4.2' },
    'live-lamp-when-off': { severity: 'error', clause: '60364-6, 6.4.3.6' },
    // Annex G is informative and clause 525 says "should".
    'voltage-drop': { severity: 'warning', clause: '60364-5-52, G.52.1', maximum: 0.03 },
  },
  // 60364-5-52 Annex G: ρ1 = 1,25 × ρ at 20 °C for copper; λ = 0,08 mΩ/m.
  conductor: { resistivity: 0.0225, reactance: 0.00008 },
};

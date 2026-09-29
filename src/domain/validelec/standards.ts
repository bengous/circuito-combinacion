import type { StandardId, StandardProfile } from './types';

/**
 * AEA 90364 (Argentina) and IEC 60364, the standards an electrician can check against.
 * Severity follows the verb of the clause: "debe" or "shall" gives an error; "se recomienda",
 * "should" or an informative text gives a warning.
 */
export const STANDARDS: Readonly<Record<StandardId, StandardProfile>> = {
  aea: {
    id: 'aea',
    rules: {
      'switch-on-neutral': { severity: 'error', clause: '90364-6-61, 613.8' },
      'live-lamp-when-off': { severity: 'error', clause: '90364-6-61, 613.8' },
    },
  },
  iec: {
    id: 'iec',
    rules: {
      'switch-on-neutral': { severity: 'error', clause: '60364-5-53:2019, 530.4.2' },
      'live-lamp-when-off': { severity: 'error', clause: '60364-6, 6.4.3.6' },
    },
  },
};

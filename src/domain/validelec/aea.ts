import { IEC } from './iec';
import type { StandardProfile } from './types';

/** AEA 90364, the Argentine rules: part 6-61 (verification) and part 7-771 (dwellings). */
export const AEA: StandardProfile = {
  id: 'aea',
  rules: {
    'switch-on-neutral': { severity: 'error', clause: '90364-6-61, 613.8' },
    'live-lamp-when-off': { severity: 'error', clause: '90364-6-61, 613.8' },
    'voltage-drop': { severity: 'error', clause: '771.13 b)', maximum: 0.03 },
  },
  // 771.19.7 a) gives the formula of IEC 60364-5-52 Annex G without its constants: it refers
  // to the manufacturer or to IEC 60287. See ADR 0006.
  conductor: IEC.conductor,
};

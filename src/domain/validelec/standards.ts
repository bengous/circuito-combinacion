import type { StandardId, StandardProfile } from './types';

/** AEA 90364 (Argentina) and IEC 60364, the standards an electrician can check against. */
export const STANDARDS: Readonly<Record<StandardId, StandardProfile>> = {
  aea: { id: 'aea' },
  iec: { id: 'iec' },
};

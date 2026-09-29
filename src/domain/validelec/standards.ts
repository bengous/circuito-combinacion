import { AEA } from './aea';
import { IEC } from './iec';
import type { StandardId, StandardProfile } from './types';

/**
 * The standards an electrician can check against, one data profile each.
 * Severity follows the verb of the clause: "debe" or "shall" gives an error; "se recomienda",
 * "should" or an informative text gives a warning.
 */
export const STANDARDS: Readonly<Record<StandardId, StandardProfile>> = { aea: AEA, iec: IEC };

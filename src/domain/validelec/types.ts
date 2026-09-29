/**
 * Vocabulary of validelec: rules checked on a circuit, and what one standard says about them.
 * A finding carries data only; the UI turns it into a sentence.
 */
import type { Positions, TerminalId } from '@/domain/circuit';

export type StandardId = 'aea' | 'iec';

export type Severity = 'error' | 'warning';

export interface StandardProfile {
  readonly id: StandardId;
}

export type Finding =
  | {
      readonly rule: 'short-circuit';
      readonly positions: Positions;
      /** Terminals at phase and neutral potential at once. */
      readonly terminals: readonly TerminalId[];
    }
  | { readonly rule: 'idle-control-point'; readonly device: string; readonly positions: Positions };

export interface Issue {
  readonly finding: Finding;
  readonly severity: Severity;
  /** Clause of the chosen standard. Null for a functional rule (short circuit, idle point). */
  readonly clause: string | null;
}

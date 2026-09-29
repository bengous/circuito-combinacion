/**
 * Vocabulary of validelec: rules checked on a circuit, and what one standard says about them.
 * A finding carries data only; the UI turns it into a sentence.
 */
import type { Positions, TerminalId } from '@/domain/circuit';

export type StandardId = 'aea' | 'iec';

export type Severity = 'error' | 'warning';

/**
 * What one standard says about one rule. `Limit` carries the rule's threshold when it has one,
 * e.g. `{ minimum: number }`.
 */
export type RuleSpec<Limit extends object = object> = {
  readonly severity: Severity;
  /** Clause as printed in the standard, e.g. "90364-6-61, 613.8". */
  readonly clause: string;
} & Limit;

export interface StandardProfile {
  readonly id: StandardId;
  /** Keyed by the `rule` of a finding. Null when the standard has no such rule. */
  readonly rules: {
    readonly 'switch-on-neutral': RuleSpec | null;
    readonly 'live-lamp-when-off': RuleSpec | null;
  };
}

export type Finding =
  | {
      readonly rule: 'short-circuit';
      readonly positions: Positions;
      /** Terminals at phase and neutral potential at once. */
      readonly terminals: readonly TerminalId[];
    }
  | { readonly rule: 'switch-on-neutral'; readonly device: string; readonly positions: Positions }
  | { readonly rule: 'live-lamp-when-off'; readonly lamp: string; readonly positions: Positions }
  | { readonly rule: 'idle-control-point'; readonly device: string; readonly positions: Positions };

export interface Issue {
  readonly finding: Finding;
  readonly severity: Severity;
  /** Clause of the chosen standard. Null for a functional rule (short circuit, idle point). */
  readonly clause: string | null;
}

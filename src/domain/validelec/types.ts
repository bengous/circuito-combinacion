/**
 * Vocabulary of validelec: rules checked on a circuit, and what one standard says about them.
 * A finding carries data only; the UI turns it into a sentence.
 */
import type { Positions, TerminalId } from '@/domain/circuit';

export type StandardId = 'aea' | 'iec';

/** What a standard says of a rule it sets. */
export type RuleSeverity = 'error' | 'warning';

/** `info`: the chosen standard has nothing to say, another standard does. */
export type Severity = RuleSeverity | 'info';

/**
 * What one standard says about one rule. `Limit` carries the rule's threshold when it has one,
 * e.g. `{ minimum: number }`.
 */
export type RuleSpec<Limit extends object = object> = {
  readonly severity: RuleSeverity;
  /** Clause as printed in the standard, e.g. "90364-6-61, 613.8". */
  readonly clause: string;
} & Limit;

export interface StandardProfile {
  readonly id: StandardId;
  /** Keyed by the `rule` of a finding. Null when the standard has no such rule. */
  readonly rules: {
    readonly 'switch-on-neutral': RuleSpec | null;
    readonly 'live-lamp-when-off': RuleSpec | null;
    /** `minimum`: section of each conductor, mm². */
    readonly 'min-section': RuleSpec<{ readonly minimum: number }> | null;
    readonly 'breaker-under-load': RuleSpec | null;
    readonly 'cable-over-breaker': RuleSpec | null;
    /** `maximum`: rated current of the breaker of a lighting circuit, A. */
    readonly 'lighting-breaker-cap': RuleSpec<{ readonly maximum: number }> | null;
    /** `maximum`: drop from the main board to the lamp, as a fraction of U. */
    readonly 'voltage-drop': RuleSpec<{ readonly maximum: number }> | null;
    /** `maximum`: drop from a sub-board to the lamp, as a fraction of U. */
    readonly 'sub-board-voltage-drop': RuleSpec<{ readonly maximum: number }> | null;
  };
  /**
   * Current-carrying capacity of PVC copper conductors in conduit (method B1, two loaded
   * conductors): base value in A by section in mm², times a factor by ambient temperature in
   * °C, times a factor by number of circuits in the conduit.
   */
  readonly ampacity: {
    readonly base: Readonly<Record<number, number>>;
    readonly temperature: Readonly<Record<number, number>>;
    readonly grouping: Readonly<Record<number, number>>;
  };
  /** Conductor constants for the voltage drop, at service temperature. */
  readonly conductor: {
    /** Ω·mm²/m. */
    readonly resistivity: number;
    /** Ω/m. */
    readonly reactance: number;
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
  | { readonly rule: 'idle-control-point'; readonly device: string; readonly positions: Positions }
  | {
      readonly rule: 'min-section';
      readonly conductor: string;
      readonly section: number;
      readonly minimum: number;
    }
  | {
      readonly rule: 'breaker-under-load';
      readonly designCurrent: number;
      readonly breaker: number;
    }
  | {
      readonly rule: 'cable-over-breaker';
      readonly conductor: string;
      readonly breaker: number;
      /** I_Z of the conductor, A. */
      readonly ampacity: number;
    }
  | { readonly rule: 'lighting-breaker-cap'; readonly breaker: number; readonly maximum: number }
  | {
      readonly rule: 'voltage-drop';
      /** Fraction of U, in the worst position where the lamp is on. */
      readonly drop: number;
      readonly maximum: number;
      readonly positions: Positions;
    }
  | {
      readonly rule: 'sub-board-voltage-drop';
      /** Fraction of U from the sub-board, in the worst position where the lamp is on. */
      readonly drop: number;
      readonly maximum: number;
      readonly positions: Positions;
    };

/** How another standard judges the same rule on the same subject. */
export interface Verdict {
  readonly standard: StandardId;
  /** Null: that standard does not flag it, having no such rule or finding the value within limits. */
  readonly severity: RuleSeverity | null;
  /** Clause of that standard for the rule; null when it has no such rule. */
  readonly clause: string | null;
}

export interface Issue {
  readonly finding: Finding;
  readonly severity: Severity;
  /** Clause of the chosen standard. Null for a functional rule, and for an `info` issue. */
  readonly clause: string | null;
  /** The other standards that judge this differently. Empty when they all agree. */
  readonly elsewhere: readonly Verdict[];
}

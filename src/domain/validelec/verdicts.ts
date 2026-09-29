import { STANDARDS } from './standards';
import type {
  Finding,
  Issue,
  RuleSeverity,
  RuleSpec,
  StandardId,
  StandardProfile,
  Verdict,
} from './types';

/** A finding with the severity and clause one standard gives it. */
export interface Judgment {
  readonly finding: Finding;
  readonly severity: RuleSeverity;
  readonly clause: string | null;
}

/** What a finding is about. Exhaustive: a new rule does not compile until it names its subject. */
function subjectOf(finding: Finding): string {
  switch (finding.rule) {
    case 'switch-on-neutral':
    case 'idle-control-point':
      return finding.device;
    case 'live-lamp-when-off':
      return finding.lamp;
    case 'min-section':
    case 'cable-over-breaker':
      return finding.conductor;
    case 'short-circuit':
    case 'breaker-under-load':
    case 'lighting-breaker-cap':
    case 'voltage-drop':
    case 'sub-board-voltage-drop':
      return 'circuit';
  }
}

/** Two standards judge the same thing when rule and subject match. */
const keyOf = (finding: Finding) => `${finding.rule}:${subjectOf(finding)}`;

function clauseOf(profile: StandardProfile, rule: Finding['rule']): string | null {
  const specs: Partial<Record<Finding['rule'], RuleSpec | null>> = profile.rules;
  return specs[rule]?.clause ?? null;
}

function verdictOf(
  [standard, judgments]: readonly [StandardId, readonly Judgment[]],
  finding: Finding,
): Verdict {
  const same = judgments.find((judgment) => keyOf(judgment.finding) === keyOf(finding));
  return same
    ? { standard, severity: same.severity, clause: same.clause }
    : { standard, severity: null, clause: clauseOf(STANDARDS[standard], finding.rule) };
}

/**
 * Issues under the chosen standard, which decides the severity. Each one lists the other
 * standards that judge it differently. A finding only other standards make comes last, as
 * `info`, with the finding of the first standard that made it.
 */
export function compareStandards(
  own: readonly Judgment[],
  others: ReadonlyArray<readonly [StandardId, readonly Judgment[]]>,
): Issue[] {
  const issues: Issue[] = own.map((judgment) => ({
    ...judgment,
    elsewhere: others
      .map((other) => verdictOf(other, judgment.finding))
      .filter((verdict) => verdict.severity !== judgment.severity),
  }));
  const seen = new Set(own.map((judgment) => keyOf(judgment.finding)));
  for (const { finding } of others.flatMap(([, judgments]) => judgments)) {
    if (seen.has(keyOf(finding))) continue;
    seen.add(keyOf(finding));
    issues.push({
      finding,
      severity: 'info',
      clause: null,
      elsewhere: others
        .map((other) => verdictOf(other, finding))
        .filter((verdict) => verdict.severity !== null),
    });
  }
  return issues;
}

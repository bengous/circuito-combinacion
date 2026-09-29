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

/** The rule and what it is about: two standards judge the same thing when this matches. */
function keyOf(finding: Finding): string {
  if ('conductor' in finding) return `${finding.rule}:${finding.conductor}`;
  if ('device' in finding) return `${finding.rule}:${finding.device}`;
  if ('lamp' in finding) return `${finding.rule}:${finding.lamp}`;
  return finding.rule;
}

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

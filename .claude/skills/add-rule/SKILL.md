---
name: add-rule
description: Add an electrical standard (a profile next to AEA 90364 and IEC 60364) or a new check to validelec, Circuito's rule module (wiring or sizing), with every value sourced, tests computed by hand and docs. Use whenever someone asks for a new standard or norm, rule, check, threshold, ampacity table, correction factor or sizing verification.
---

# Add a standard or a rule to validelec

The module is `src/domain/validelec/`; how it works is in `docs/architecture.md` ("Les règles
électriques"), why in ADR 0005 (rules per standard) and ADR 0006 (sizing). TypeScript lists
most edits: run `npm run typecheck` after each step and follow it. This skill covers what the
compiler cannot check.

## 1. Sources, before any code

The values reach a working electrician: a wrong threshold ships a wrong verdict.

1. Read every threshold, table row and clause number in the standard's own text, never from
   memory. Keep for each value: clause or table, figure, URL, and a tag (official text,
   unofficial full copy, manufacturer datasheet, secondary source).
2. A value from a research subagent counts only once you have read it yourself in the source
   (download the text, grep it). Mark what you could not read as unconfirmed, with where you
   looked.
3. Cite clauses by number (`clause: '771.13 b)'`). Never link or commit an unauthorized copy.
4. Severity follows the verb: "debe" or "shall" gives `error`; "se recomienda", "should" or an
   informative annex gives `warning`. A standard without the rule gives `null`.
5. Copy tables whole. A missing row throws; never interpolate.
6. A choice the text leaves open (a method, a constant, where the load sits) gets an ADR and
   goes in the PR's "À trancher".
7. Write the expected test values by hand first, with their arithmetic, and have a fresh
   subagent recompute every one against `solve.ts` before you code.

## 2. A new standard

1. Its id in `StandardId` (`types.ts`); a profile file like `aea.ts`: every key of `rules`
   (spec or `null`), the `ampacity` tables, the `conductor` constants; its entry in
   `STANDARDS` (`standards.ts`).
2. Its tables must cover `sound` in `src/test/installations.ts` (30 °C, 1 circuit, 1,5 mm²),
   or `checkInstallation` throws in every sizing test.
3. Tests: `wiring.test.ts` and `dimensioning.test.ts` run it by themselves; the compiler asks
   for its clauses in their per-standard records. `verdicts.test.ts` goes red where
   `elsewhere` gains the new standard: recompute and update, never delete.

## 3. A new rule

1. A `Finding` variant in `types.ts`: data only, the UI will phrase it in `es.ts`. A key in
   `StandardProfile.rules`, typed `RuleSpec<{ readonly maximum: number }>` when it has a
   limit, then a spec or `null` in every profile.
2. The function. A wiring rule reads a `CircuitDefinition` and tries every position of
   `demoSequence` (`wiring.ts`); a sizing rule reads an `Installation` (`dimensioning.ts`).
   One finding per subject (circuit, device, lamp, conductor), at the first or the worst
   position. Compare strictly: a value equal to the limit passes.
3. Register it in `check.ts`. A wiring rule goes in `WiringRuleId` and `WIRING_RULES`; if
   you forget `WiringRuleId`, the compiler asks for it in `DIMENSIONING_RULES` instead. A
   sizing rule goes in `DIMENSIONING_RULES`. A rule true under every standard goes in
   `FUNCTIONAL_RULES`, with no profile key: nothing checks that one. The order of these
   records is the order of the issues.
4. `subjectOf` in `verdicts.ts`: the compiler asks for the new rule's subject.
5. Tests: one faulty fixture per rule, built from `combinacionSimple` (wiring, in
   `wiring.test.ts`) or in `src/test/installations.ts` (sizing). Expected values from step
   1.7, with the arithmetic in a comment and `expect.closeTo`. See each test red before the
   code; for a formula, also break it on purpose (a unit, a factor) and see it red.

## Done when

`npm run check` is green (domain functions at 100 %); every new value has its source in the
PR; the rule tables of ADR 0005 or 0006 and `docs/architecture.md` list the new standard or
rule.

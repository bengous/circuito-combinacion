# Operating manual for AI agents

Circuito is a one-page simulator of lighting circuits "en combinación" (2 to 4 control
points). **The user is a 75-year-old Argentine electrician on an iPhone (Safari), sometimes
in landscape, often with the "Muy grande" text size.** Every change is judged on that phone.

Read first: `docs/architecture.md` (how it is built), `docs/adr/` (why). Docs and PR
descriptions are in French; code, comments and commit messages in English; UI text in
Spanish (Argentina: "vos", "tocá").

## Checks

| When                  | Run                                                          |
| --------------------- | ------------------------------------------------------------ |
| While coding          | `npm test` (or `npm run test:watch`), `npm run fix`          |
| Before every commit   | `npm run check`: types, Biome, Knip, file size, tests + coverage |
| UI or layout changed  | `npm run test:e2e` (Playwright on the build; see below)      |

Hooks enforce this: pre-commit formats, commit-msg checks `type(scope): summary`, pre-push
runs `npm run check`. CI runs the same, plus the e2e job. Never skip hooks, never weaken,
skip or delete a test, never lower a coverage threshold to get green.

`npm run test:e2e` builds and serves `dist/` on port 4177. Without a downloaded Playwright
browser, point it at an installed Chromium: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome`.
A server already on that port is reused, so make sure it serves a fresh build.

## Where things go

| What                                   | Where                                                   |
| -------------------------------------- | ------------------------------------------------------- |
| Electrical model (plain TS, no React)  | `src/domain/circuit/`, circuits in `src/domain/catalog/` |
| Electrical rules (AEA, IEC)            | `src/domain/validelec/`, profiles in `standards.ts`     |
| Drawing: geometry (pure) / SVG parts   | `src/features/schematic/geometry/`, `.../parts/`        |
| Main screen, demo, messages            | `src/features/simulator/`                               |
| Settings, themes, cable palette        | `src/features/settings/`                                |
| Reusable UI and layout primitives      | `src/shared/ui/` (see the table in architecture.md)     |
| Every user-facing string               | `src/i18n/es.ts`                                        |
| Colours, spacing, radii, tap sizes     | `src/styles/tokens.css` (per theme)                     |
| Unit/UI tests                          | next to the code, `*.test.ts(x)`                        |
| Browser tests                          | `e2e/` (`fixtures.ts`, `measure.ts`, `*.spec.ts`)       |
| Decisions                              | `docs/adr/NNNN-*.md` (French)                           |

Rules (tooling enforces most of them):

- Layers: `app → features → domain`; `features → shared, i18n`. `src/domain/` never imports
  React or UI layers (Biome).
- Files ≤ 200 lines in `src/` (`npm run check:size`): split by responsibility.
- Named exports only; export only what another module uses (Knip).
- CSS Modules next to the component; values only from tokens. A `className` passed to a
  primitive places it (flex, grid), it does not restyle it.
- No hard-coded text in components. No colour outside `tokens.css` except the cable
  palette in `cableColors.ts` (one value per theme).

## Recipes

- **Add a circuit**: follow `docs/ajouter-un-schema.md` (skill: `add-circuit`).
- **Add a feature**: a folder in `src/features/<name>/` with its components, hooks, CSS
  Modules and tests. Pure logic goes in a plain `.ts` file (tested without React) or in the
  domain if it is electrical. Use `shared/ui` primitives; put new strings in `es.ts`.
  If it changes a rule of the architecture, update `docs/architecture.md` and add an ADR.
- **Add a UI component**: first check `src/shared/ui/` (`Button`, `IconButton`,
  `SegmentedControl`, `Dialog`, `VisuallyHidden`, `AppShell`, `StageLayout`). Generic →
  `shared/ui/` (no domain imports, no texts: take them as props); feature-specific → the
  feature folder. Native elements first (`<button>`, `<dialog>`, `<fieldset>`), tap targets
  ≥ 44 px (`--tap-min`), a visible `:focus-visible`, an accessible name.
- **Change colours**: edit `tokens.css` / `cableColors.ts`; `tokens.test.ts` and
  `cableColors.test.ts` check contrast in both themes (text ≥ 4.5:1, graphics ≥ 3:1).
  Never convey state by colour alone.
- **Change layout**: rules live in `AppShell` / `StageLayout` and the drawing floor
  (`.frame` in `Schematic.module.css`, `MIN_SCALE`). The page scrolls; nothing is squeezed.
  Do not add per-screen media queries.

## Verify mobile and accessibility (skill: `verify-mobile`)

1. `npm run test:e2e`: viewport matrix (320×568, 390×664, 844×390, 1280×800 × Normal /
   Muy grande × night / day × 2-3-4 points), journeys, axe with zero violations.
2. For visual changes, look at screenshots yourself at 390×664 (Muy grande, 4 points) and
   844×390 (landscape), in both themes. Settings are in localStorage key
   `circuito.settings.v1`, e.g. `{"textSize":"huge","theme":"day"}`.
3. Screen readers: live regions must stay quiet during the demo; landmarks are `<header>`
   and `<main>`; every control has a name (`semantics.test.tsx`).

## Definition of done

- [ ] Behaviour covered by tests (domain exhaustive; UI by role and name).
- [ ] `npm run check` green; `npm run test:e2e` green if the UI changed.
- [ ] Checked at phone sizes, both themes, "Muy grande"; no horizontal scroll; tap
      targets ≥ 44 px; nothing below its floor.
- [ ] Strings in `es.ts`, colours in tokens, no dead code (Knip).
- [ ] Docs updated when a rule or behaviour changes (`architecture.md`, ADR, this file).
- [ ] Small commits, `type(scope): summary`; PR in French using the template.

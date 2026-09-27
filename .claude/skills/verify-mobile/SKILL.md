---
name: verify-mobile
description: Check that Circuito still works on the user's iPhone (portrait, landscape, "Muy grande" text, day and night themes) and stays accessible, before committing any UI, CSS, layout, colour or text change. Use after touching src/features, src/shared/ui, src/styles or src/i18n.
---

# Verify mobile and accessibility

## 1. Automated checks

```sh
npm run check        # types, Biome, Knip, file size, unit tests + coverage, contrast tests
npm run test:e2e     # builds dist/, serves it on :4177, runs Playwright (Chromium)
```

No Playwright browser downloaded? Use an installed Chromium:
`PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome npm run test:e2e`.
A server already running on :4177 is reused: stop it, or rebuild first.

What the e2e suite covers (`e2e/`):

- `layout.spec.ts`: 320×568, 390×664, 844×390, 1280×800 × Normal / Muy grande × night / day
  × 2-3-4 points. No horizontal overflow; the visible drawing is at least its floor; every
  control reachable by a tap; tap targets ≥ 44 px. 2 and 3 points fit one screen at
  360×740 and 390×664. No overflow at 180×370 (200% zoom).
- `journeys.spec.ts`: switches → lamp, keyboard, picker, broken link, settings dialog after
  scrolling, demo, settings kept after a reload.
- `a11y.spec.ts`: axe (WCAG 2.2 AA + best practices), zero violations, both themes.
- Any console error fails a test.

On failure, open `playwright-report/index.html` (CI uploads it as an artifact).

## 2. Look at it

Tests do not judge looks. For visual changes, take screenshots of the built app (Playwright
script or browser devtools) and look at them yourself:

- 390×664, "Muy grande", 4 points, both themes (iPhone with Safari bars);
- 844×390 landscape (drawing on the left, panel on the right);
- 360×740, normal text, 2 and 3 points: everything on one screen.

Seed settings before loading: localStorage `circuito.settings.v1` =
`{"textSize":"huge","theme":"day"}`.

Check: nothing cut or overlapping, texts in the drawing readable, lamp state visible,
buttons at least 44 px, focus ring visible with the keyboard.

## 3. Screen reader sanity

`src/app/semantics.test.tsx` covers landmarks, headings, names and live regions. If you add
a live region, silence it while the demo runs. If you add a control, give it a name from
`es.ts`.

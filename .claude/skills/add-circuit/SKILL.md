---
name: add-circuit
description: Add a new lighting circuit (e.g. combinación with three cruces, or a new device kind such as a pulsador or telerruptor) to Circuito's catalog, with its tests, e2e coverage and docs. Use whenever someone asks for a new schema, circuit or switch type.
---

# Add a circuit

The full reference is `docs/ajouter-un-schema.md` (French). Steps:

## A. Another chain circuit (combinación + N cruces)

1. Create `src/domain/catalog/<id>.ts` with `defineChainCircuit({ id, title, stages })`
   (copy `combinacion-dos-cruces.ts`). Stage ids are `llave1`, `cruce1`…, `llave2`;
   names are what the user reads ("Cruce 3"). The title is Spanish.
2. Add it to `CATALOG` in `src/domain/catalog/index.ts` (menu order = points of control).
3. Add `{ id, points, title }` to `CIRCUITS` in `e2e/fixtures.ts`.
4. Run `npm run check`. The exhaustive tests (`solve.test.ts`, `positions.test.ts`,
   `layout.test.ts`) pick the circuit up by themselves: read their output, don't assume.
5. Run `npm run test:e2e` (see the `verify-mobile` skill). A taller circuit makes the page
   scroll; the drawing must never be below its floor.

## B. A new device kind

1. `DeviceKind` in `src/domain/circuit/types.ts`; its terminals, number of positions and
   contacts per position in `DEVICE_KINDS` (`src/domain/circuit/devices.ts`). Do not touch
   the solver.
2. Build the circuit: a `CircuitDefinition`, or a small builder like `chain.ts`.
3. Drawing: a symbol in `src/features/schematic/parts/`, dispatched in `DeviceSymbol.tsx`;
   state text in `deviceText.ts`. A different shape of schematic needs a new
   `CircuitLayout` type and a strategy in `features/schematic/geometry/`.
4. Strings in `src/i18n/es.ts` (Spanish, Argentina).
5. Tests: in which positions the lamp lights (domain), the symbol's accessible name
   (UI), then steps A.3 to A.5.
6. An ADR in `docs/adr/` if the choice shapes the project; update `docs/architecture.md`.

## Done when

`npm run check` and `npm run test:e2e` are green, the new circuit shows in the picker, and
each switch toggles with a tap and with Enter.

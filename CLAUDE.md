# Notes for AI assistants

Read `docs/architecture.md` first. Key rules:

- Run `npm run check` before committing (types, Biome, file size, tests). CI runs the same.
- `src/domain/` is plain TypeScript: no React, no UI imports (enforced by Biome).
- Keep files under 200 lines (`npm run check:size`); split by responsibility instead.
- Named exports only. CSS Modules next to components; colours only from `styles/tokens.css`.
- Every user-facing string lives in `src/i18n/es.ts` (Spanish, Argentina: "vos", "tocá").
- New circuits: follow `docs/ajouter-un-schema.md`.
- The user is on a phone: test at 360×740, keep tap targets ≥ 44px.

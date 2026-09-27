# 0001. Pile technique

- Statut : acceptée
- Date : 2026-09-27 (consigne une décision prise lors de la refonte, PR #1)

## Contexte

Un simulateur d'une seule page, sans serveur, utilisé surtout sur iPhone par un électricien
âgé. Il doit rester simple à maintenir, par des humains comme par des agents.

## Décision

- **React 19 + TypeScript strict + Vite** : écosystème courant, typage fort
  (`noUncheckedIndexedAccess`, `erasableSyntaxOnly`), build statique pour GitHub Pages.
- **Pas de bibliothèque d'état ni de routeur** : `useReducer` et un contexte pour les
  réglages suffisent ; le circuit choisi vit dans le hash de l'URL (`useHashValue`).
- **CSS Modules + jetons CSS** (`tokens.css`) plutôt qu'une bibliothèque de composants :
  quelques primitives maison dans `shared/ui` couvrent les besoins, sans dépendance.
- **Biome** (lint + format en un outil), **Vitest** + Testing Library, **Playwright** pour
  l'E2E, **Knip** contre le code mort, **lefthook** pour les hooks git.
- Dépendances d'exécution réduites au minimum : React, React DOM, la police Barlow.

## Conséquences

- Une nouvelle dépendance doit se justifier (taille, maintenance) dans sa PR.
- Si un jour il faut plusieurs écrans, un routeur sera à reconsidérer (nouvelle ADR).

# 0002. Le domaine est un graphe

- Statut : acceptée
- Date : 2026-09-27 (consigne une décision prise lors de la refonte, PR #1)

## Contexte

La première version codait à la main l'état de chaque schéma (2, 3, 4 points). Chaque
nouveau schéma demandait de nouvelles conditions, et les erreurs étaient faciles.

## Décision

Un circuit est décrit comme un **graphe** : bornes (nœuds), câbles (arêtes permanentes),
interrupteurs (arêtes qui dépendent de la position), lampe (charge à traverser). Un seul
solveur générique (`solve()`, deux parcours en largeur depuis la phase et le neutre) calcule
tension, courant et lampe pour n'importe quel circuit. Le comportement de chaque type
d'interrupteur est déclaré une fois dans `DEVICE_KINDS`.

Le domaine (`src/domain/`) est du TypeScript pur, sans React ni textes affichés ; Biome
interdit ces imports.

## Conséquences

- Ajouter un schéma en chaîne = une déclaration (`defineChainCircuit`) ; les tests
  exhaustifs, le dessin, le menu et la démo suivent (voir `docs/ajouter-un-schema.md`).
- Un nouveau type d'appareil s'ajoute dans `devices.ts`, sans toucher au solveur.
- Le dessin est séparé du modèle : une nouvelle forme de schéma demande une stratégie de
  géométrie dans `features/schematic/geometry/`.

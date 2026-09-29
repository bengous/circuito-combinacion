# 0003. Mise en page : la page défile, le dessin a un plancher

- Statut : acceptée
- Date : 2026-09-27 (PR « Audit mobile et accessibilité »)

## Contexte

L'écran avait une hauteur fixe (`height: 100dvh`) et le dessin prenait « ce qui reste »
(`minmax(0, 1fr)`). En paysage sur iPhone, ou avec le texte « Muy grande », il restait 0 à
30 px : le schéma défilait dans une boîte minuscule et les interrupteurs disparaissaient.
Chaque correction ajoutait une media query de plus.

## Décision

- La page a une hauteur **minimale** (un écran), jamais fixe : quand tout ne tient pas,
  c'est **la page qui défile**.
- Le dessin a un **plancher** calculé depuis sa taille naturelle :
  `taille naturelle × MIN_SCALE (0,85) × taille du texte`, limité par la largeur disponible
  (unités de conteneur `cqi`). Au-dessus du plancher, il grandit pour remplir l'écran.
- Les règles de disposition vivent dans **deux primitives** (`AppShell`, `StageLayout`),
  pas dans chaque écran :
  - portrait : une colonne (toolbar, summary, stage, panel) ;
  - paysage téléphone et ≥ 900 px : stage à gauche, colonne latérale en `rem` à droite ;
  - grand texte : la colonne latérale s'élargit (rem) dans la limite de 50 % de la largeur,
    et de 24 rem au-delà (`clamp(16rem, 50%, 24rem)`).
- `--viewport-height` = `100svh` (repli `100vh`) : stable quand Safari masque ses barres.

## Conséquences

- 2 et 3 points tiennent toujours sur un écran à 360×740 et 390×664 (texte normal) ; le
  reste défile au lieu d'être écrasé. La suite E2E vérifie ces deux points.
- Un nouvel écran réutilise `AppShell` / `StageLayout`, ou ajoute une primitive documentée,
  plutôt que ses propres media queries.
- Nécessite iOS 16+ pour `cqi` (repli : plancher simple, sans limite par la largeur).

# Architecture

Les décisions et leurs raisons sont dans [`docs/adr/`](adr/README.md). Ce document décrit
l'état actuel.

## Les couches

```
app  ──►  features  ──►  domain
             │
             └──►  shared, i18n
```

Une flèche veut dire « peut importer ». Jamais dans l'autre sens.

- **`domain/`** : le modèle électrique, en TypeScript pur. Il ne connaît ni React, ni le DOM,
  ni les textes affichés. Biome le vérifie (`noRestrictedImports` dans `biome.json`), comme
  l'interdiction pour `features` d'importer `app`, et pour `shared` d'importer le domaine, une
  fonctionnalité ou les textes.
- **`features/`** : l'interface, découpée par fonctionnalité. Une fonctionnalité peut utiliser
  les parties publiques d'une autre (par exemple `simulator` affiche le `Schematic`).
- **`shared/`** : ce qui ne sait rien du métier : primitives d'interface (`shared/ui`),
  stockage local, hooks génériques.
- **`i18n/`** : tous les textes. Aucun texte en dur dans les composants.
- **`app/`** : l'assemblage (`App.tsx`) et le filet de sécurité (`ErrorBoundary`).

## Le modèle électrique

Un circuit est un **graphe** (voir [ADR 0002](adr/0002-domaine-en-graphe.md)) :

- les **bornes** (`TerminalId`, par exemple `llave1.common`) sont les nœuds ;
- les **câbles** (`Conductor`) relient toujours deux bornes ;
- les **interrupteurs** (`Device`) relient certaines de leurs bornes selon leur position.
  Le comportement de chaque type est décrit une seule fois dans `domain/circuit/devices.ts` ;
- la **lampe** n'est pas une arête : le courant doit la traverser.

`solve()` fait deux parcours en largeur, un depuis la phase et un depuis le neutre :

- une borne atteinte depuis la phase est **sous tension** ;
- la lampe est **allumée** si un côté touche la phase et l'autre le neutre ;
- le **courant** passe par le chemin phase → lampe → neutre.

`diagnose()` dit où la phase s'arrête quand la lampe est éteinte. Le texte affiché est
construit dans `features/simulator/message.ts`, pas dans le domaine.

Ce modèle est générique : un nouveau type d'interrupteur (pulsador, telerruptor…) s'ajoute
dans `devices.ts` sans toucher au solveur.

## Le dessin

`features/schematic/` sépare deux choses :

1. **la géométrie** (`geometry/`) : des fonctions pures qui calculent où placer chaque borne,
   chaque boîtier et chaque texte. Aujourd'hui une seule stratégie, `chain` (verticale) ;
2. **les composants** (`parts/`) : ils dessinent à partir de la géométrie et de l'état.
   Chaque symbole a son fichier (`CombinacionSymbol`, `CruceSymbol`, `LampSymbol`…).

Le style d'un fil (couleur, épaisseur, animation) est décidé dans `wireStyle.ts`, testé à
part. L'état ne passe jamais par la couleur seule : épaisseur et mouvement pour le courant,
bornes plus grosses quand elles sont sous tension.

## La mise en page

Voir [ADR 0003](adr/0003-mise-en-page.md). Deux primitives de `shared/ui` portent toutes
les règles de mise en page ; les écrans ne réinventent pas leurs propres media queries :

- **`AppShell`** : le cadre de la page. Au moins un écran de haut (`min-height`, jamais une
  hauteur fixe) : quand tout ne tient pas, **la page défile**, rien n'est écrasé. Marges
  hors de l'encoche et de la barre d'accueil (`env(safe-area-inset-*)`).
- **`StageLayout`** + **`StageRegion`** : quatre zones, `toolbar`, `summary`, `stage`, `panel`.
  - téléphone en portrait (et tablette en portrait) : une colonne, dans cet ordre ;
  - téléphone en paysage et écrans de 900 px ou plus : le `stage` à gauche, les autres
    zones dans une colonne latérale à droite ;
  - le `stage` prend la hauteur qui reste, sans descendre sous le **plancher** fixé par son
    contenu ;
  - grand texte : la colonne latérale est en `rem`, elle s'élargit avec la taille du texte.

Le dessin fixe son plancher lui-même (`.frame` dans `Schematic.module.css`) :
taille naturelle × `MIN_SCALE` (0,85) × taille du texte, limité par la largeur disponible.
Avec « Muy grande », le dessin grandit donc vraiment (et la page défile).

`--viewport-height` (dans `tokens.css`) vaut `100svh` (écran avec les barres de Safari
affichées, stable pendant le défilement), avec `100vh` pour les navigateurs plus anciens.

## Les primitives d'interface (`shared/ui`)

| Composant          | Rôle                                                                |
| ------------------ | ------------------------------------------------------------------- |
| `AppShell`         | Cadre de page (voir plus haut)                                      |
| `StageLayout`      | Zones de l'écran principal (voir plus haut)                         |
| `Button`           | Bouton texte, 52 px de haut ; `primary`, `secondary`, `outline`, `active` |
| `IconButton`       | Bouton icône 46 × 46 avec nom accessible (`label`)                  |
| `SegmentedControl` | Choix exclusif (groupe nommé de boutons `aria-pressed`)             |
| `Dialog`           | Fenêtre modale sur `<dialog>` : titre, corps qui défile, pied       |
| `VisuallyHidden`   | Texte pour lecteurs d'écran seulement                               |

Avant d'écrire du CSS pour un bouton, une fenêtre ou une mise en page, utiliser (ou
compléter) ces primitives.

## Thèmes et couleurs

- Tous les jetons (couleurs, espacements, rayons, tailles de cible tactile) sont dans
  `styles/tokens.css`, avec un bloc par thème (`[data-theme="night"|"day"]`).
- Les couleurs de câbles choisies par l'utilisateur sont en TypeScript
  (`features/settings/cableColors.ts`), **une valeur par thème** (`ThemedColor`).
- Règles de contraste, vérifiées par `styles/tokens.test.ts` et `cableColors.test.ts`, qui
  lisent `tokens.css` lui-même : texte ≥ 4,5:1, graphismes nécessaires à la lecture du
  schéma (câbles, même estompés, bornes, anneau de la lampe…) ≥ 3:1, dans les deux thèmes.
- La couleur des barres du navigateur (`<meta name="theme-color">`) suit `--bg`.

## Accessibilité

- Repères : `<header>` (titre et réglages), `<main>` (tout le simulateur). La fenêtre de
  réglages est rendue hors du `<header>`.
- Chaque interrupteur du dessin se commande au clavier et a un nom lisible
  (« Llave 1, Posición A. Tocar para cambiar. »). Le dessin est un `role="group"` nommé.
- Le message et l'état de la lampe sont des zones live, **coupées pendant la démo**.
- Cibles tactiles ≥ 44 px (`--tap-min`), 52 px pour les actions principales (`--tap-lg`).

## Tests

Voir [ADR 0004](adr/0004-strategie-de-test.md).

- **Domaine** : exhaustif (toutes les combinaisons de chaque schéma).
- **Interface** : par le comportement, avec Testing Library (`app/*.test.tsx`), y compris
  la sémantique (`app/semantics.test.tsx`).
- **Contrastes** : calculés depuis `tokens.css`.
- **E2E** (`e2e/`, Playwright) sur le build : matrice d'écrans × taille de texte × thème,
  parcours utilisateur, axe-core.
- **Couverture** : seuils minimaux dans `vitest.config.ts` ; **Knip** refuse le code mort.

## Conventions

- **Fichiers courts** : 200 lignes maximum dans `src/` (`npm run check:size`). Au-delà, découper.
- **Exports nommés** seulement (pas d'`export default`, sauf fichiers de configuration).
  N'exporter que ce qui sert ailleurs (Knip le vérifie).
- **Styles** : CSS Modules à côté du composant, valeurs uniquement via les jetons de
  `styles/tokens.css`. `className` sur une primitive : pour placer (flex, grid), pas pour
  la redessiner.
- **Tests** à côté du code (`*.test.ts`).
- **Commits** : `type(portée): résumé` (Conventional Commits, vérifié par le hook
  `commit-msg`).

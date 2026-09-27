# Architecture

## Les couches

```
app  ──►  features  ──►  domain
             │
             └──►  shared, i18n
```

Une flèche veut dire « peut importer ». Jamais dans l'autre sens.

- **`domain/`** : le modèle électrique, en TypeScript pur. Il ne connaît ni React, ni le DOM,
  ni les textes affichés. Biome le vérifie (`noRestrictedImports` dans `biome.json`).
- **`features/`** : l'interface, découpée par fonctionnalité. Une fonctionnalité peut utiliser
  les parties publiques d'une autre (par exemple `simulator` affiche le `Schematic`).
- **`shared/`** : ce qui ne sait rien du métier (boutons, stockage local, hooks génériques).
- **`i18n/`** : tous les textes. Aucun texte en dur dans les composants.

## Le modèle électrique

Un circuit est un **graphe** :

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

Le style d'un fil (couleur, animation) est décidé dans `wireStyle.ts`, testé à part.

## Conventions

- **Fichiers courts** : 200 lignes maximum dans `src/` (`npm run check:size`). Au-delà, découper.
- **Exports nommés** seulement (pas d'`export default`).
- **Styles** : CSS Modules à côté du composant, couleurs uniquement via les variables de
  `styles/tokens.css`.
- **Tests** à côté du code (`*.test.ts`) : le domaine est testé de façon exhaustive
  (toutes les combinaisons de chaque schéma), l'interface par le comportement
  (`app/App.test.tsx`, avec Testing Library).
- **Accessibilité** : chaque interrupteur du dessin se commande aussi au clavier et a un nom
  lisible par un lecteur d'écran.

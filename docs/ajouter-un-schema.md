# Ajouter un schéma

## Un circuit en chaîne (combinación avec N cruces)

1. Créer `src/domain/catalog/<id>.ts` :

   ```ts
   import { defineChainCircuit } from './chain';

   export const combinacionTresCruces = defineChainCircuit({
     id: 'combinacion-tres-cruces',
     title: 'Combinación con tres cruces',
     stages: [
       { id: 'llave1', kind: 'combinacion', name: 'Llave 1' },
       { id: 'cruce1', kind: 'cruce', name: 'Cruce 1' },
       { id: 'cruce2', kind: 'cruce', name: 'Cruce 2' },
       { id: 'cruce3', kind: 'cruce', name: 'Cruce 3' },
       { id: 'llave2', kind: 'combinacion', name: 'Llave 2' },
     ],
   });
   ```

2. L'ajouter à la liste `CATALOG` dans `src/domain/catalog/index.ts`.
3. L'ajouter à `CIRCUITS` dans `e2e/fixtures.ts` (un test E2E échoue sinon).
4. Vérifier : `npm run check`, puis `npm run test:e2e` (le nouveau schéma passe dans toute
   la matrice d'écrans : s'il est plus haut, la page défile, le dessin ne doit pas être
   écrasé).

Le dessin, le menu, la démo et les tests exhaustifs (`solve.test.ts`, `positions.test.ts`,
`layout.test.ts`) le prennent en compte automatiquement. `layout.test.ts` vérifie aussi que
le dessin dit la même chose que le modèle : chaque borne placée, jamais deux au même point,
les lettres de pont du modèle (prédicats de `src/test/schematicConsistency.ts`). Pour 5
points ou plus, vérifier à 320×568 que le sélecteur (« 5 puntos ») reste lisible.

## Un autre type de circuit (telerruptor, sensor…)

1. **Nouvel appareil** : ajouter son type dans `DeviceKind` (`domain/circuit/types.ts`) et son
   comportement dans `DEVICE_KINDS` (`domain/circuit/devices.ts`) : ses bornes, son nombre de
   positions et quelles bornes sont reliées dans chaque position.
2. **Le circuit** : écrire directement un `CircuitDefinition` (bornes, câbles, appareils,
   lampe), ou un petit constructeur comme `chain.ts` s'il y aura plusieurs variantes.
3. **Le dessin** : si la chaîne verticale ne convient pas, ajouter un type de `CircuitLayout`
   et sa stratégie dans `features/schematic/geometry/`, puis le symbole de l'appareil dans
   `features/schematic/parts/` et son aiguillage dans `DeviceSymbol.tsx`.
4. **Les textes d'interface** dans `src/i18n/es.ts`. Les noms d'appareils et de câbles
   (`name`, `Conductor.label`) viennent du catalogue : ce sont des noms de métier, pas des
   textes d'écran.
5. **Les tests** : au minimum, vérifier dans quelles positions la lampe s'allume ; ajouter
   le circuit à `e2e/fixtures.ts`.
6. **Une ADR** (`docs/adr/`) si le choix structure le projet (nouvelle géométrie, nouveau
   type de charge).

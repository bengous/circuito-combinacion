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

C'est tout : le dessin, le menu, la démo et les tests exhaustifs
(`solve.test.ts`, `positions.test.ts`, `layout.test.ts`) le prennent en compte automatiquement.

## Un autre type de circuit (telerruptor, sensor…)

1. **Nouvel appareil** : ajouter son type dans `DeviceKind` (`domain/circuit/types.ts`) et son
   comportement dans `DEVICE_KINDS` (`domain/circuit/devices.ts`) : ses bornes, son nombre de
   positions et quelles bornes sont reliées dans chaque position.
2. **Le circuit** : écrire directement un `CircuitDefinition` (bornes, câbles, appareils,
   lampe), ou un petit constructeur comme `chain.ts` s'il y aura plusieurs variantes.
3. **Le dessin** : si la chaîne verticale ne convient pas, ajouter un type de `CircuitLayout`
   et sa stratégie dans `features/schematic/geometry/`, puis le symbole de l'appareil dans
   `features/schematic/parts/` et son aiguillage dans `DeviceSymbol.tsx`.
4. **Les textes** dans `src/i18n/es.ts`.
5. **Les tests** : au minimum, vérifier dans quelles positions la lampe s'allume.

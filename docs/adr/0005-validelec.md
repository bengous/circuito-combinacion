# 0005. validelec : règles électriques par norme

- Statut : acceptée
- Date : 2026-09-29

## Contexte

Circuito va devenir une boîte à outils électriques pour téléphone. Aucune règle électrique
n'était écrite comme telle : le court-circuit était un test de `solve.test.ts`, et
l'interrupteur sur le neutre n'était vérifié nulle part.

Aucune bibliothèque ne fait ce travail en TypeScript. `@tscircuit/checks` vérifie des cartes
électroniques. L'ERC de KiCad vérifie la connectivité ; essayé sur nos circuits, il ne voit
pas un interrupteur sur le neutre. `circuit-bricks` vérifie les ports des composants
(inexistant, non relié, deux sorties reliées). GElectrical et python-electric, en Python,
calculent des tableaux électriques (chute de tension, choix du disjoncteur). Aucune ne
connaît la phase, le neutre ou l'AEA.

Un premier choix gardait ces vérifications en prédicats de test, sans module. Il est
renversé ici : l'app aura plusieurs outils, et l'électricien choisira sa norme.

## Décision

- Un module du domaine, `src/domain/validelec/`, applique des règles nommées.
  `checkCircuit(circuit, norme)` essaie chaque combinaison de positions (`demoSequence`)
  avec `solve()`. Une règle donne au plus un constat par sujet (circuit, appareil, lampe),
  à la première position fautive.
- Les règles **fonctionnelles** valent pour toute norme : un circuit qui les enfreint ne
  marche pas. Elles sont toujours `error`, sans article.
- Les autres règles viennent d'une norme. Chaque norme est un **profil de données**
  (`standards.ts`) : pour chaque règle, la gravité et l'article, ou `null` si la norme n'a
  pas cette règle. Une troisième norme est un profil de plus, pas du code.
- La norme choisie décide de la gravité, selon le verbe du texte : « debe » ou « shall »
  donne `error` ; « se recomienda », « should » ou un texte informatif donne `warning`.
- Un constat contient des données, jamais de texte, comme `Diagnosis` : l'interface en fera
  une phrase dans `es.ts`.
- Les règles tournent dans les tests seulement : `wiring.test.ts` vérifie tout le catalogue
  avec chaque norme. Le choix de la norme dans l'interface viendra avec le premier outil qui
  affiche des résultats.
- Les articles sont cités par leur numéro, jamais par un lien vers une copie non autorisée.

| Règle                | Sujet     | AEA 90364                  | IEC 60364                          |
| -------------------- | --------- | -------------------------- | ---------------------------------- |
| `short-circuit`      | circuit   | fonctionnelle              | fonctionnelle                      |
| `idle-control-point` | appareil  | fonctionnelle              | fonctionnelle                      |
| `switch-on-neutral`  | appareil  | `error`, 90364-6-61, 613.8 | `error`, 60364-5-53:2019, 530.4.2  |
| `live-lamp-when-off` | lampe     | `error`, 90364-6-61, 613.8 | `error`, 60364-6, 6.4.3.6          |

## Conséquences

- AEA 613.8 (« Prueba de polaridad ») est un article de **vérification** : les interrupteurs
  « deben interrumpir siempre un conductor de línea y nunca el conductor neutro », et la
  phase arrive au contact central de la douille. Aucun article d'installation équivalent
  n'a été trouvé dans l'AEA 90364-7-771 (éd. 2006) ni dans le projet 90364-7-770 (2016), qui
  renvoie lui-même à 613.8. L'article 530.4 de l'AEA 90364-5 n'a pas été lu (texte payant).
- `demoSequence` refuse un appareil à plus de deux positions : un télérupteur devra
  l'étendre. L'IEC (536.5.1.2) permet alors de couper le neutre pour certains appareils de
  commande (détecteur, variateur, télérupteur) : `switch-on-neutral` devra connaître le type
  d'appareil.
- Le dimensionnement (section, disjoncteur, chute de tension) entrera dans ce module avec un
  type `Installation` séparé : `CircuitDefinition` ne change pas.
- Le test de court-circuit a quitté `solve.test.ts`. Le test de parité y reste : il fixe
  aussi que la lampe est allumée au repos.

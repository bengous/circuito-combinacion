# 0004. Stratégie de test

- Statut : acceptée
- Date : 2026-09-27 (PR « Outillage »)

## Contexte

L'audit mobile a trouvé des défauts que les tests unitaires ne pouvaient pas voir : dessin
écrasé à certaines tailles d'écran, contrastes insuffisants, zones live trop bavardes.
L'utilisateur est sur iPhone, parfois en paysage, avec un grand texte.

## Décision

Chaque niveau teste ce qu'il voit le mieux :

| Niveau                | Outil                        | Quoi                                               |
| --------------------- | ---------------------------- | -------------------------------------------------- |
| Domaine               | Vitest                       | Toutes les combinaisons de chaque schéma           |
| Interface             | Vitest + Testing Library     | Comportement et sémantique (rôles, noms, live)     |
| Couleurs              | Vitest, lit `tokens.css`     | Contrastes ≥ 4,5:1 (texte), ≥ 3:1 (graphismes)     |
| Navigateur réel       | Playwright (Chromium), build | Matrice écran × texte × thème ; parcours ; axe     |

- Les tests d'interface interrogent comme un utilisateur (`getByRole`, nom accessible),
  jamais par classe CSS.
- La matrice E2E vérifie : pas de défilement horizontal, dessin au-dessus de son plancher
  (partie réellement visible), commandes atteignables, cibles ≥ 44 px, aucune erreur console.
- axe-core (WCAG 2.2 AA + bonnes pratiques) doit donner **zéro** violation.
- Couverture v8 avec seuils minimaux (plus stricts pour le domaine) ; Knip refuse les
  exports, fichiers et dépendances inutilisés.
- `npm run check` (hook pre-push et CI) : types, Biome, Knip, taille des fichiers, tests +
  couverture. L'E2E tourne dans un job CI séparé (et en local avec `npm run test:e2e`).

## Conséquences

- On ne supprime ni n'affaiblit un test pour passer au vert ; on ne baisse pas un seuil.
- Chromium seulement : Safari n'est pas testé automatiquement. Les techniques CSS utilisées
  doivent rester compatibles iOS 16+ et être vérifiées à la main en cas de doute.
- La liste des circuits E2E est écrite à la main (`e2e/fixtures.ts`) ; un test échoue si
  elle ne correspond plus au menu.

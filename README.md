# Circuito

Simulateur interactif de circuits d'éclairage « en combinación » (va-et-vient), de 2 à 4 points
de commande. Pensé pour un électricien, utilisé surtout sur téléphone. Interface en espagnol
(Argentine).

- Touchez un interrupteur : la lampe, les fils sous tension et le courant se mettent à jour.
- « Ver tensión » montre les fils qui restent sous tension quand la lampe est éteinte.
- Réglages : thème nuit/jour, taille du texte, couleur de chaque fil (gardés sur l'appareil).

L'ancienne version reste accessible dans `public/legacy/combinacion-v1.html`.

## Démarrer

Node 22 ou plus (voir `.nvmrc`).

```sh
npm install      # installe aussi les hooks git (lefthook)
npm run dev      # http://localhost:5173
```

## Commandes

| Commande                | Rôle                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run dev`           | Serveur de développement                                          |
| `npm run build`         | Vérifie les types puis construit `dist/`                          |
| `npm run preview`       | Sert `dist/` en local                                             |
| `npm run typecheck`     | TypeScript strict                                                 |
| `npm run lint`          | Biome : lint + format (échoue aussi sur les avertissements)       |
| `npm run lint:unused`   | Knip : fichiers, exports et dépendances inutilisés                |
| `npm run fix`           | Corrige automatiquement lint et formatage                         |
| `npm test`              | Tests unitaires et d'interface (Vitest)                           |
| `npm run test:coverage` | Les mêmes, avec les seuils de couverture                          |
| `npm run test:e2e`      | Tests de bout en bout (Playwright, Chromium) sur le build         |
| `npm run check`         | Types, Biome, Knip, taille des fichiers, tests + couverture       |

Pour `test:e2e`, installer une fois le navigateur : `npx playwright install chromium`
(ou pointer `PLAYWRIGHT_CHROMIUM_EXECUTABLE` vers un Chromium déjà installé).

Hooks (lefthook) : avant chaque commit, Biome formate les fichiers modifiés ; le message
doit suivre `type(portée): résumé` ; avant chaque push, `npm run check`.
La CI lance `check` et, dans un job séparé, `test:e2e` (rapport HTML en artefact si échec).

## Organisation du code

```
src/
  domain/           Modèle électrique en TypeScript pur (aucun React)
    circuit/        Types, interrupteurs, solveur, diagnostic, séquence de démo
    catalog/        Un fichier par schéma + la liste des schémas
  features/         Une fonctionnalité = un dossier
    schematic/      Dessin SVG d'un circuit (géométrie séparée des composants)
    simulator/      Écran principal : état, démo, message, barre d'état
    settings/       Réglages : modèle, sauvegarde, fenêtre de réglages
  shared/           Primitives d'interface (ui/), stockage, hooks génériques
  i18n/es.ts        Tous les textes affichés
  styles/           Jetons de design (thèmes) et styles globaux
  app/              Assemblage de l'application, filet d'erreurs
e2e/                Tests Playwright (matrice d'écrans, parcours, axe)
docs/adr/           Décisions d'architecture
.claude/skills/     Procédures pour les agents (ajouter un schéma, vérifier le mobile)
```

Détails et règles : [docs/architecture.md](docs/architecture.md).
Ajouter un schéma : [docs/ajouter-un-schema.md](docs/ajouter-un-schema.md).
Décisions : [docs/adr/](docs/adr/README.md). Pour les agents : [CLAUDE.md](CLAUDE.md).

## Déploiement

Chaque push sur `master` vérifie, construit et publie le site sur GitHub Pages
(`.github/workflows/deploy.yml`). Dans les réglages du dépôt, **Settings → Pages → Source**
doit être sur **GitHub Actions**.

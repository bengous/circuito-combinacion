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

| Commande            | Rôle                                                       |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Serveur de développement                                   |
| `npm run build`     | Vérifie les types puis construit `dist/`                   |
| `npm run preview`   | Sert `dist/` en local                                      |
| `npm run typecheck` | TypeScript strict                                          |
| `npm run lint`      | Biome : lint + format (échoue aussi sur les avertissements)|
| `npm run fix`       | Corrige automatiquement lint et formatage                  |
| `npm test`          | Tests (Vitest)                                             |
| `npm run check`     | Tout ce qui précède, comme la CI                           |

Avant chaque commit, le hook formate les fichiers modifiés ; avant chaque push, il lance
`npm run check`.

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
  shared/           Composants et utilitaires génériques (boutons, stockage, hooks)
  i18n/es.ts        Tous les textes affichés
  styles/           Jetons de design (thèmes) et styles globaux
  app/App.tsx       Assemblage de l'application
```

Détails et règles : [docs/architecture.md](docs/architecture.md).
Ajouter un schéma : [docs/ajouter-un-schema.md](docs/ajouter-un-schema.md).

## Déploiement

Chaque push sur `master` vérifie, construit et publie le site sur GitHub Pages
(`.github/workflows/deploy.yml`). Dans les réglages du dépôt, **Settings → Pages → Source**
doit être sur **GitHub Actions**.

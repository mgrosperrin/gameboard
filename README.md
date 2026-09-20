# Gameboard

Application web mobile pour gérer et calculer les scores de vos jeux.

- React + TypeScript + Vite
- [Mantine](https://mantine.dev) pour l'UI
- Données stockées dans le `localStorage` du navigateur
- Déploiement automatique sur GitHub Pages via GitHub Actions

## Développement

```bash
npm install
npm run dev
```

Qualité : `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.

## Ajouter un jeu

1. Créer un dossier `src/games/<mon-jeu>/`.
2. Y exporter un objet qui implémente `GameDefinition<TState>` (voir [src/games/types.ts](src/games/types.ts)) :
   - `createInitialState` : état initial de la partie ;
   - `computeScores` : calcul des points à partir de l'état ;
   - `Board` : composant React affiché pendant la partie.
3. L'enregistrer dans `games` dans [src/games/registry.ts](src/games/registry.ts).

`TheGame` ([src/games/the-game/theGame.tsx](src/games/the-game/theGame.tsx)) est un jeu fictif de référence.

## Déploiement

Le workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) construit et publie le site à
chaque push sur `main`. Activer GitHub Pages avec la source « GitHub Actions » dans les paramètres du dépôt.

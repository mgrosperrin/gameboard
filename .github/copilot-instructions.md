# Instructions Copilot — Gameboard

Réponds toujours en français.

## Le projet

Application web **mobile-first** pour gérer des joueurs et calculer les scores de parties de jeux de
société. Aucun backend : tout est stocké dans le `localStorage` du navigateur. Le site est publié sur
GitHub Pages via GitHub Actions.

## Stack

React 19 · TypeScript · Vite · Mantine (UI) · `@phosphor-icons/react` · React Router (`HashRouter`,
obligatoire pour GitHub Pages) · Vitest + Testing Library · oxlint + oxfmt.

## Commandes

| Commande               | Rôle                            |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Serveur de développement        |
| `npm run format`       | Formate le code (oxfmt)         |
| `npm run format:check` | Vérifie le formatage            |
| `npm run lint`         | Analyse statique (oxlint)       |
| `npm run typecheck`    | `tsc -b --noEmit`               |
| `npm run test`         | Tests Vitest                    |
| `npm run build`        | Typecheck + build de production |

**Avant de considérer une tâche terminée** : `npm run format`, `npm run lint`, `npm run test` et
`npm run build` doivent passer. Le workflow de déploiement exécute les mêmes étapes.

## Langue

- Code, noms de fichiers, identifiants, types et messages de commit : **anglais**.
- Textes affichés à l'utilisateur, commentaires et documentation : **français**.
- Pas d'i18n : les libellés français sont écrits en dur dans les composants.

## Architecture

```
src/
  domain/types.ts          Modèle métier : Player, Match, PlayerScore
  storage/                 Stores persistés dans le localStorage
  games/                   Un dossier par jeu + registry.ts + types.ts (contrat GameDefinition)
  pages/                   Un composant par route
  components/              Composants partagés (AppLayout, Scoreboard)
  test/setup.ts            Setup Vitest (matchMedia, localStorage)
```

Flux de données : les pages lisent l'état via les hooks des stores (`usePlayers`, `useMatches`,
`useMatch`) et le modifient via les fonctions exportées par ces mêmes stores. `MatchPage` est un
shell générique : il ne connaît aucun jeu, il délègue au `GameDefinition` résolu par le registry.

## Conventions

- **Persistance** : passer par `createPersistedStore` (`src/storage/createPersistedStore.ts`).
  Ne jamais appeler `localStorage` directement depuis un composant. Utiliser `window.localStorage`
  et non le global `localStorage` (masqué par Node en test).
- **UI** : utiliser les composants Mantine et leurs props de style (`gap`, `p`, `c`, `fw`…). Pas de
  fichier CSS ni de `style` inline sauf nécessité réelle. Conteneur mobile étroit, boutons pleine
  largeur, cibles tactiles confortables.
- **Icônes** : uniquement `@phosphor-icons/react`, noms suffixés `Icon` (`TrashIcon`, `PlusIcon`).
- **Dépendances** : versions **épinglées exactement** dans `package.json` (pas de `^` ni `~`).
  Installer avec `npm install --save-exact`.
- **Jeux** : un dossier par jeu dans `src/games/<kebab-case>/`, enregistré dans
  `src/games/registry.ts`. Voir les instructions dédiées dans `.github/instructions/`.
- **Routing** : ajouter les routes dans `src/App.tsx`, toujours sous `AppLayout`.
- **Tests** : fichiers `*.test.tsx` à côté du code testé. Tester en priorité les fonctions de calcul
  de score et les stores.

## Pièges connus

- Ne pas remplacer `HashRouter` par `BrowserRouter` : les URL profondes casseraient sur GitHub Pages.
- `base` de Vite est fourni par la variable `VITE_BASE_PATH` dans le workflow ; ne pas le coder en
  dur.
- Les noms des joueurs sont snapshotés dans `Match.playerNames` : une partie terminée reste lisible
  même si le joueur est renommé ou supprimé. Ne pas résoudre les joueurs depuis le store des joueurs
  dans les écrans de partie.

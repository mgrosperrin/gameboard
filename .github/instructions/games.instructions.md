---
description: "Règles d'implémentation d'un jeu et de son calcul de score dans src/games/."
applyTo: 'src/games/**'
---

# Ajouter ou modifier un jeu

Chaque jeu est autonome : il possède son état, son mécanisme de calcul de points et son écran de
partie. Le reste de l'application (routing, persistance, tableau des scores) est générique et ne doit
jamais être modifié pour accommoder un jeu particulier.

## Structure

```
src/games/<kebab-case>/
  <camelCase>.tsx        Définition du jeu + composant Board
  <camelCase>.test.tsx   Tests du calcul de score et du Board
```

Enregistrer ensuite le jeu dans le tableau `games` de `src/games/registry.ts`.

## Contrat

Implémenter `GameDefinition<TState>` (voir `src/games/types.ts`) :

| Membre                    | Rôle                                                                    |
| ------------------------- | ----------------------------------------------------------------------- |
| `id`                      | Identifiant stable en kebab-case, **jamais modifié** après publication  |
| `name`                    | Nom affiché                                                             |
| `description`             | Phrase courte en français                                               |
| `minPlayers`/`maxPlayers` | Bornes vérifiées à la création de la partie                             |
| `createInitialState`      | État initial, à partir des joueurs                                      |
| `computeScores`           | Fonction **pure** dérivant les scores de l'état                         |
| `lowerScoreWins`          | Optionnel, si le plus petit score gagne                                 |
| `showScoreboard`          | Optionnel, `false` tant que le tableau des scores n'a pas d'intérêt     |
| `Board`                   | Écran de partie, reçoit `GameBoardProps<TState>`                        |
| `Details`                 | Optionnel, détail du jeu (ex. manches) rangé dans la section « Avancé » |

## Règles

- **L'état est la source de vérité, les scores sont dérivés.** Ne jamais stocker les totaux dans
  l'état : `computeScores` les recalcule à chaque rendu.
- **`computeScores` doit être pure et déterministe** : pas de date, d'aléatoire ni d'accès au
  stockage. Retourner une entrée par joueur, dans l'ordre reçu ; le tri est fait par `Scoreboard`.
- **L'état doit être sérialisable en JSON** (il est persisté tel quel dans `Match.state`) : pas de
  `Date`, `Map`, `Set` ni de fonction. Utiliser des chaînes ISO pour les dates.
- **Inclure un champ `version`** dans l'état et gérer les états plus anciens de façon tolérante :
  d'anciennes parties sont déjà stockées chez les utilisateurs.
- **Ne pas gérer la persistance** : `Board` reçoit `state` et `setState`, la sauvegarde est faite par
  `MatchPage`. Toujours mettre à jour via une fonction de mise à jour immuable.
- **Ne pas afficher de tableau des scores** dans `Board` : `MatchPage` rend déjà `Scoreboard`, en
  haut de l'écran, avant le `Board`.
- **Ne pas ajouter de bouton « terminer la partie »** dans `Board` sauf condition de fin propre au
  jeu ; utiliser alors la prop `finish`.
- **Respecter `isFinished`** : quand la partie est terminée, les contrôles de saisie doivent être
  désactivés.
- Saisie de scores sur mobile : `NumberInput` Mantine avec `inputMode="numeric"`, ou des boutons
  d'incrément.

## Tests attendus

- `computeScores` sur un état représentatif, y compris les cas limites (aucun point, égalité).
- Rendu du `Board` avec Testing Library, encapsulé dans `<MantineProvider>`.

import type { Match, Player } from '../domain/types';
import { createId } from '../utils/createId';
import { createPersistedStore } from './createPersistedStore';

const store = createPersistedStore<Match[]>('gameboard.matches', []);

export const useMatches = store.use;

export function useMatch(id: string | undefined): Match | undefined {
  return store.use().find((match) => match.id === id);
}

export function createMatch(gameId: string, players: Player[], initialState: unknown): Match {
  const match: Match = {
    id: createId(),
    gameId,
    playerIds: players.map((player) => player.id),
    playerNames: Object.fromEntries(players.map((player) => [player.id, player.name])),
    createdAt: new Date().toISOString(),
    finishedAt: null,
    state: initialState,
  };
  store.set((matches) => [match, ...matches]);
  return match;
}

export function updateMatchState(id: string, state: unknown): void {
  store.set((matches) => matches.map((match) => (match.id === id ? { ...match, state } : match)));
}

export function finishMatch(id: string): void {
  store.set((matches) =>
    matches.map((match) =>
      match.id === id ? { ...match, finishedAt: new Date().toISOString() } : match,
    ),
  );
}

export function reopenMatch(id: string): void {
  store.set((matches) =>
    matches.map((match) => (match.id === id ? { ...match, finishedAt: null } : match)),
  );
}

export function deleteMatch(id: string): void {
  store.set((matches) => matches.filter((match) => match.id !== id));
}

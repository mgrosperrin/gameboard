import type { Player } from '../domain/types';
import { createId } from '../utils/createId';
import { createPersistedStore } from './createPersistedStore';

const store = createPersistedStore<Player[]>('gameboard.players', []);

export const usePlayers = store.use;

export const getPlayers = store.get;

export function addPlayer(name: string): Player {
  const player: Player = {
    id: createId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  store.set((players) => [...players, player]);
  return player;
}

export function renamePlayer(id: string, name: string): void {
  store.set((players) =>
    players.map((player) => (player.id === id ? { ...player, name: name.trim() } : player)),
  );
}

export function deletePlayer(id: string): void {
  store.set((players) => players.filter((player) => player.id !== id));
}

export function playerNameExists(name: string, exceptId?: string): boolean {
  const normalized = name.trim().toLocaleLowerCase();
  return store
    .get()
    .some((player) => player.id !== exceptId && player.name.toLocaleLowerCase() === normalized);
}

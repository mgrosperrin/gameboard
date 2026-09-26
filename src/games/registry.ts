import { theGame } from './the-game/theGame';
import { skyjo } from './skyjo/skyjo';
import type { AnyGameDefinition } from './types';

/** Add a new game here to make it available in the whole application. */
export const games: AnyGameDefinition[] = [theGame, skyjo];

export function getGame(id: string | undefined): AnyGameDefinition | undefined {
  return games.find((game) => game.id === id);
}

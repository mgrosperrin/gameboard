export interface Player {
  id: string;
  name: string;
  createdAt: string;
}

export interface Match {
  id: string;
  gameId: string;
  /** Ids of the players taking part, in play order. */
  playerIds: string[];
  /** Name snapshot, so a finished match stays readable if a player is renamed/deleted. */
  playerNames: Record<string, string>;
  createdAt: string;
  finishedAt: string | null;
  /** Game specific state, owned by the game definition. */
  state: unknown;
}

export interface PlayerScore {
  playerId: string;
  score: number;
}

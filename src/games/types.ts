import type { ComponentType } from 'react';
import type { Player, PlayerScore } from '../domain/types';

export interface GameBoardProps<TState> {
  /** Players of the match, in play order. */
  players: Player[];
  state: TState;
  setState: (next: TState | ((previous: TState) => TState)) => void;
  scores: PlayerScore[];
  isFinished: boolean;
  finish: () => void;
  reopen: () => void;
}

export interface GameDefinition<TState = unknown> {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  /** Builds the game specific state stored with the match. */
  createInitialState: (players: Player[]) => TState;
  /** Derives the scoreboard from the game state. Sorting is handled by the shell. */
  computeScores: (state: TState, players: Player[]) => PlayerScore[];
  /** Higher score wins unless the game says otherwise. */
  lowerScoreWins?: boolean;
  /** Screen rendered while the match is running. */
  Board: ComponentType<GameBoardProps<TState>>;
}

/** Erased variant used by the registry and the match shell, which are game agnostic. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyGameDefinition = GameDefinition<any>;

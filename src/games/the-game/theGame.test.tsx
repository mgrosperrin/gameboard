import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Player } from '../../domain/types';
import { theGame } from './theGame';

const players: Player[] = [
  { id: '1', name: 'Alice', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: '2', name: 'Bob', createdAt: '2026-01-01T00:00:00.000Z' },
];

describe('theGame', () => {
  it('donne un score à chaque joueur', () => {
    const state = theGame.createInitialState(players);

    expect(theGame.computeScores(state, players)).toEqual([
      { playerId: '1', score: 0 },
      { playerId: '2', score: 0 },
    ]);
  });

  it('affiche les joueurs de la partie', () => {
    render(
      <MantineProvider>
        <theGame.Board
          players={players}
          state={theGame.createInitialState(players)}
          setState={() => {}}
          scores={[]}
          isFinished={false}
          finish={() => {}}
          reopen={() => {}}
        />
      </MantineProvider>,
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});

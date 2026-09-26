import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Player } from '../../domain/types';
import { skyjo, type SkyjoState } from './skyjo';

const players: Player[] = [
  { id: '1', name: 'Alice', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: '2', name: 'Bob', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: '3', name: 'Chloé', createdAt: '2026-01-01T00:00:00.000Z' },
];

describe('skyjo', () => {
  it('calcule le score à partir des cartes restantes', () => {
    const state: SkyjoState = {
      version: 3,
      rounds: [
        {
          completedBy: null,
          scoreDoubled: false,
          scores: { '1': 11, '2': 4, '3': 0 },
        },
      ],
    };

    expect(skyjo.computeScores(state, players)).toEqual([
      { playerId: '1', score: 11 },
      { playerId: '2', score: 4 },
      { playerId: '3', score: 0 },
    ]);
  });

  it('calcule les cumuls et double le score du joueur terminant sans être le plus bas', () => {
    const state: SkyjoState = {
      version: 3,
      rounds: [
        { scores: { '1': 20, '2': 4, '3': 7 }, completedBy: '1', scoreDoubled: true },
        { scores: { '1': 2, '2': 5, '3': 8 }, completedBy: '1', scoreDoubled: false },
      ],
    };

    expect(skyjo.computeScores(state, players)).toEqual([
      { playerId: '1', score: 22 },
      { playerId: '2', score: 9 },
      { playerId: '3', score: 15 },
    ]);
  });

  it('double le score en cas d\u2019égalité pour le plus petit score', () => {
    const state: SkyjoState = {
      version: 3,
      rounds: [{ scores: { '1': 10, '2': 5, '3': 8 }, completedBy: '1', scoreDoubled: true }],
    };

    expect(skyjo.computeScores(state, players)).toEqual([
      { playerId: '1', score: 10 },
      { playerId: '2', score: 5 },
      { playerId: '3', score: 8 },
    ]);
  });

  it('affiche la saisie et les joueurs', () => {
    render(
      <MantineProvider>
        <skyjo.Board
          players={players}
          state={skyjo.createInitialState(players)}
          setState={() => {}}
          scores={[]}
          isFinished={false}
          finish={() => {}}
          reopen={() => {}}
        />
      </MantineProvider>,
    );

    expect(screen.getByText('Fin de manche')).toBeInTheDocument();
    expect(screen.getByLabelText('Joueur terminant')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Joueur terminant'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByRole('img', { name: 'Carte Skyjo -2' })).toBeInTheDocument();
  });

  it('enregistre les cartes sélectionnées dans une nouvelle manche', () => {
    const initialState = skyjo.createInitialState(players);
    let nextState: SkyjoState | undefined;

    render(
      <MantineProvider>
        <skyjo.Board
          players={players}
          state={initialState}
          setState={(next) => {
            nextState = typeof next === 'function' ? next(initialState) : next;
          }}
          scores={[]}
          isFinished={false}
          finish={() => {}}
          reopen={() => {}}
        />
      </MantineProvider>,
    );

    fireEvent.change(screen.getByLabelText('Joueur terminant'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    fireEvent.change(screen.getAllByLabelText('Nombre')[0], { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter la manche' }));

    expect(nextState?.rounds[0]).toEqual({
      completedBy: '1',
      scoreDoubled: false,
      scores: { '1': -2, '2': 0, '3': 0 },
    });
  });

  it('bloque une étape à 12 cartes et limite une valeur à 8 cartes', () => {
    render(
      <MantineProvider>
        <skyjo.Board
          players={players}
          state={skyjo.createInitialState(players)}
          setState={() => {}}
          scores={[]}
          isFinished={false}
          finish={() => {}}
          reopen={() => {}}
        />
      </MantineProvider>,
    );

    fireEvent.change(screen.getByLabelText('Joueur terminant'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    const cardCounts = screen.getAllByLabelText('Nombre');
    fireEvent.change(cardCounts[0], { target: { value: '8' } });
    fireEvent.change(cardCounts[1], { target: { value: '4' } });

    expect(screen.getByText(/11 cartes maximum/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeDisabled();
  });
});

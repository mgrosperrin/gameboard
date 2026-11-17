import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

  it('n’affiche le tableau des scores qu’une fois une manche enregistrée', () => {
    expect(skyjo.showScoreboard?.(skyjo.createInitialState(players))).toBe(false);
    expect(
      skyjo.showScoreboard?.({
        version: 3,
        rounds: [{ scores: { '1': 1, '2': 2, '3': 3 }, completedBy: null, scoreDoubled: false }],
      }),
    ).toBe(true);
  });

  it('détaille les manches enregistrées', () => {
    const state: SkyjoState = {
      version: 3,
      rounds: [{ scores: { '1': 20, '2': 4, '3': 7 }, completedBy: '1', scoreDoubled: true }],
    };
    const Details = skyjo.Details!;

    render(
      <MantineProvider>
        <Details
          players={players}
          state={state}
          setState={() => {}}
          scores={[]}
          isFinished={false}
          finish={() => {}}
          reopen={() => {}}
        />
      </MantineProvider>,
    );

    expect(screen.getByText('Manche 1')).toBeInTheDocument();
    expect(screen.getByText('Score doublé')).toBeInTheDocument();
    expect(screen.getByText('Terminée par Alice')).toBeInTheDocument();
    expect(screen.getByText('Alice : 20')).toBeInTheDocument();
  });

  function renderBoard(setState: (next: SkyjoState) => void = () => {}) {
    const initialState = skyjo.createInitialState(players);
    render(
      <MantineProvider>
        <skyjo.Board
          players={players}
          state={initialState}
          setState={(next) => setState(typeof next === 'function' ? next(initialState) : next)}
          scores={[]}
          isFinished={false}
          finish={() => {}}
          reopen={() => {}}
        />
      </MantineProvider>,
    );
  }

  function goToCards(playerName = 'Alice') {
    fireEvent.click(screen.getByRole('button', { name: playerName }));
  }

  function tapCard(value: number) {
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Carte Skyjo ${value}\\b`) }));
  }

  it('passe à la saisie des cartes dès que le joueur terminant est touché', () => {
    renderBoard();

    expect(screen.getByText('Qui a terminé la manche ?')).toBeInTheDocument();
    expect(screen.queryByLabelText('Joueur terminant')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Alice' }));
    expect(screen.getByRole('img', { name: 'Carte Skyjo -2' })).toBeInTheDocument();
    expect(screen.queryByText('Qui a terminé la manche ?')).not.toBeInTheDocument();
  });

  it('commence la saisie par le joueur terminant puis suit l’ordre des joueurs en boucle', () => {
    renderBoard();

    fireEvent.click(screen.getByRole('button', { name: 'Bob' }));
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Chloé')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Chloé')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terminer' })).toBeInTheDocument();
  });

  it('reprend au début de la liste quand le dernier joueur termine', () => {
    renderBoard();

    fireEvent.click(screen.getByRole('button', { name: 'Chloé' }));
    expect(screen.getByText('Chloé')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Alice')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('enregistre les cartes touchées dans une nouvelle manche', () => {
    vi.spyOn(Date, 'now').mockReturnValue(0);
    let nextState: SkyjoState | undefined;
    renderBoard((next) => {
      nextState = next;
    });

    goToCards();
    tapCard(-2);
    vi.spyOn(Date, 'now').mockReturnValue(10_000);
    tapCard(-2);
    vi.spyOn(Date, 'now').mockReturnValue(20_000);
    tapCard(5);
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Terminer' }));

    expect(nextState?.rounds[0]).toEqual({
      completedBy: '1',
      scoreDoubled: true,
      scores: { '1': 2, '2': 0, '3': 0 },
    });
    vi.restoreAllMocks();
  });

  it('retire une carte avec un double tap', () => {
    vi.spyOn(Date, 'now').mockReturnValue(0);
    renderBoard();
    goToCards();

    tapCard(3);
    expect(screen.getByLabelText('1 en main')).toBeInTheDocument();

    vi.spyOn(Date, 'now').mockReturnValue(10_000);
    tapCard(3);
    vi.spyOn(Date, 'now').mockReturnValue(10_100);
    tapCard(3);
    expect(screen.queryByLabelText(/en main/)).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it('limite une valeur à 8 cartes et un joueur à 12 cartes', () => {
    renderBoard();
    goToCards();

    for (let index = 0; index < 10; index += 1) {
      vi.spyOn(Date, 'now').mockReturnValue(index * 10_000);
      tapCard(1);
    }
    expect(screen.getByLabelText('8 en main')).toBeInTheDocument();
    expect(screen.getByText('8 / 12 cartes')).toBeInTheDocument();

    for (let index = 0; index < 5; index += 1) {
      vi.spyOn(Date, 'now').mockReturnValue(1_000_000 + index * 10_000);
      tapCard(2);
    }
    expect(screen.getByLabelText('4 en main')).toBeInTheDocument();
    expect(screen.getByText('12 / 12 cartes')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});

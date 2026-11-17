import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Match } from '../domain/types';
import { deletePlayer, addPlayer, getPlayers } from '../storage/playersStore';
import { NewMatchPage } from './NewMatchPage';

// Le store garde son état en mémoire d'un test à l'autre.
beforeEach(() => {
  getPlayers().forEach((player) => deletePlayer(player.id));
});

function getMatches(): Match[] {
  return JSON.parse(window.localStorage.getItem('gameboard.matches') ?? '[]');
}

function renderPage() {
  render(
    <MantineProvider>
      <MemoryRouter initialEntries={['/matches/new']}>
        <Routes>
          <Route path="/matches/new" element={<NewMatchPage />} />
          <Route path="/matches/:matchId" element={<p>Partie démarrée</p>} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  );
  fireEvent.click(screen.getByText('Skyjo'));
}

describe('NewMatchPage', () => {
  it('démarre la partie avec les joueurs dans l’ordre de sélection', () => {
    addPlayer('Alice');
    addPlayer('Bob');
    addPlayer('Chloé');
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Chloé/ }));
    fireEvent.click(screen.getByRole('button', { name: /Alice/ }));
    fireEvent.click(screen.getByRole('button', { name: /Bob/ }));

    expect(screen.getByLabelText('Position 1').closest('button')).toHaveTextContent('Chloé');
    expect(screen.getByLabelText('Position 2').closest('button')).toHaveTextContent('Alice');

    fireEvent.click(screen.getByRole('button', { name: 'Démarrer la partie' }));

    const [match] = getMatches();
    expect(match.playerIds.map((id) => match.playerNames[id])).toEqual(['Chloé', 'Alice', 'Bob']);
  });

  it('renumérote les joueurs quand on en désélectionne un', () => {
    addPlayer('Alice');
    addPlayer('Bob');
    addPlayer('Chloé');
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Alice/ }));
    fireEvent.click(screen.getByRole('button', { name: /Bob/ }));
    fireEvent.click(screen.getByRole('button', { name: /Chloé/ }));
    fireEvent.click(screen.getByRole('button', { name: /Alice/ }));

    expect(screen.getByLabelText('Position 1').closest('button')).toHaveTextContent('Bob');
    expect(screen.getByLabelText('Position 2').closest('button')).toHaveTextContent('Chloé');
  });

  it('ajoute rapidement un joueur et le sélectionne', () => {
    addPlayer('Alice');
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Alice/ }));
    fireEvent.change(screen.getByLabelText('Nom du nouveau joueur'), {
      target: { value: 'Dina' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(screen.getByLabelText('Position 2').closest('button')).toHaveTextContent('Dina');
    expect(screen.getByLabelText('Nom du nouveau joueur')).toHaveValue('');
  });

  it('refuse un joueur déjà existant', () => {
    addPlayer('Alice');
    renderPage();

    fireEvent.change(screen.getByLabelText('Nom du nouveau joueur'), {
      target: { value: 'alice' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(screen.getByText('Ce joueur existe déjà.')).toBeInTheDocument();
  });
});

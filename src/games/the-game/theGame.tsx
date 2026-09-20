import { Alert, List, Stack, Text, ThemeIcon } from '@mantine/core';
import { InfoIcon, UserIcon } from '@phosphor-icons/react';
import type { GameBoardProps, GameDefinition } from '../types';

/** Placeholder state: TheGame does not track anything yet. */
export interface TheGameState {
  version: 1;
}

function TheGameBoard({ players }: GameBoardProps<TheGameState>) {
  return (
    <Stack gap="md">
      <Alert icon={<InfoIcon size={18} />} color="blue" variant="light">
        Jeu de démonstration : il affiche seulement les joueurs de la partie.
      </Alert>

      <Text fw={600}>Joueurs de la partie</Text>
      <List spacing="xs" center>
        {players.map((player) => (
          <List.Item
            key={player.id}
            icon={
              <ThemeIcon color="blue" size={24} radius="xl">
                <UserIcon size={14} />
              </ThemeIcon>
            }
          >
            {player.name}
          </List.Item>
        ))}
      </List>
    </Stack>
  );
}

export const theGame: GameDefinition<TheGameState> = {
  id: 'the-game',
  name: 'TheGame',
  description: 'Jeu fictif servant à valider la mécanique de l’application.',
  minPlayers: 1,
  maxPlayers: 12,
  createInitialState: () => ({ version: 1 }),
  computeScores: (_state, players) => players.map((player) => ({ playerId: player.id, score: 0 })),
  Board: TheGameBoard,
};

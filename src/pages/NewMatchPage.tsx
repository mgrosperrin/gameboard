import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { UserPlusIcon, WarningIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

import type { Player } from '../domain/types';
import { games, getGame } from '../games/registry';
import { selectableCardProps } from '../components/selectableCardProps';
import { createMatch } from '../storage/matchesStore';
import { addPlayer, playerNameExists, usePlayers } from '../storage/playersStore';

export function NewMatchPage() {
  const navigate = useNavigate();
  const players = usePlayers();
  const [step, setStep] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [newNameError, setNewNameError] = useState<string | null>(null);

  const game = getGame(gameId ?? undefined);
  // L'ordre de sélection est l'ordre de jeu.
  const selectedPlayers = selectedIds
    .map((id) => players.find((player) => player.id === id))
    .filter((player): player is Player => player !== undefined);

  const countIsValid =
    game !== undefined &&
    selectedPlayers.length >= game.minPlayers &&
    selectedPlayers.length <= game.maxPlayers;

  const handleSelectGame = (id: string) => {
    setGameId(id);
    setStep(1);
  };

  const togglePlayer = (id: string) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  };

  const handleAddPlayer = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setNewNameError('Le nom est obligatoire.');
      return;
    }
    if (playerNameExists(trimmed)) {
      setNewNameError('Ce joueur existe déjà.');
      return;
    }
    const player = addPlayer(trimmed);
    if (game && selectedIds.length < game.maxPlayers) {
      setSelectedIds((ids) => [...ids, player.id]);
    }
    setNewName('');
    setNewNameError(null);
  };

  const handleStart = () => {
    if (!game || !countIsValid) return;
    const match = createMatch(game.id, selectedPlayers, game.createInitialState(selectedPlayers));
    navigate(`/matches/${match.id}`, { replace: true });
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Nouvelle partie</Title>

      <Stepper active={step} onStepClick={setStep} size="sm" allowNextStepsSelect={false}>
        <Stepper.Step label="Jeu" description={game?.name}>
          <Stack gap="xs" mt="md">
            {games.map((item) => (
              <Card
                key={item.id}
                withBorder
                padding="sm"
                onClick={() => handleSelectGame(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2}>
                    <Text fw={600}>{item.name}</Text>
                    <Text size="sm" c="dimmed">
                      {item.description}
                    </Text>
                  </Stack>
                  <Badge variant="light">
                    {item.minPlayers}-{item.maxPlayers} joueurs
                  </Badge>
                </Group>
              </Card>
            ))}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Joueurs" description={`${selectedPlayers.length} sélectionné(s)`}>
          <Stack gap="sm" mt="md">
            <Text size="sm" c="dimmed">
              Touchez les joueurs dans l’ordre de jeu souhaité.
            </Text>

            {players.length === 0 ? (
              <Alert icon={<WarningIcon size={18} />} color="yellow">
                Aucun joueur enregistré. Ajoutez-en un ci-dessous.
              </Alert>
            ) : (
              <Stack gap="xs">
                {players.map((player) => {
                  const position = selectedIds.indexOf(player.id);
                  const selected = position !== -1;
                  return (
                    <Card
                      key={player.id}
                      component="button"
                      type="button"
                      withBorder
                      padding="sm"
                      aria-pressed={selected}
                      {...selectableCardProps(selected)}
                      style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                      onClick={() => togglePlayer(player.id)}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Text fw={selected ? 700 : 500} truncate>
                          {player.name}
                        </Text>
                        {selected && (
                          <Badge circle size="lg" aria-label={`Position ${position + 1}`}>
                            {position + 1}
                          </Badge>
                        )}
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            )}

            <Group align="flex-start" gap="xs" wrap="nowrap">
              <TextInput
                flex={1}
                aria-label="Nom du nouveau joueur"
                placeholder="Nouveau joueur"
                value={newName}
                error={newNameError}
                onChange={(event) => {
                  setNewName(event.currentTarget.value);
                  setNewNameError(null);
                }}
                onKeyDown={(event) => event.key === 'Enter' && handleAddPlayer()}
              />
              <Button onClick={handleAddPlayer} leftSection={<UserPlusIcon size={18} />}>
                Ajouter
              </Button>
            </Group>

            {game && !countIsValid && (
              <Text size="sm" c="dimmed">
                Sélectionnez entre {game.minPlayers} et {game.maxPlayers} joueurs.
              </Text>
            )}

            <Button onClick={handleStart} disabled={!countIsValid} size="lg" fullWidth>
              Démarrer la partie
            </Button>
          </Stack>
        </Stepper.Step>
      </Stepper>
    </Stack>
  );
}

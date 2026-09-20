import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Stack,
  Stepper,
  Text,
  Title,
} from '@mantine/core';
import { WarningIcon } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';

import { games, getGame } from '../games/registry';
import { createMatch } from '../storage/matchesStore';
import { usePlayers } from '../storage/playersStore';

export function NewMatchPage() {
  const navigate = useNavigate();
  const players = usePlayers();
  const [step, setStep] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const game = getGame(gameId ?? undefined);
  const selectedPlayers = players.filter((player) => selectedIds.includes(player.id));

  const countIsValid =
    game !== undefined &&
    selectedPlayers.length >= game.minPlayers &&
    selectedPlayers.length <= game.maxPlayers;

  const handleSelectGame = (id: string) => {
    setGameId(id);
    setStep(1);
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
            {players.length === 0 ? (
              <Alert icon={<WarningIcon size={18} />} color="yellow">
                Aucun joueur enregistré.{' '}
                <Text component={Link} to="/players" fw={600} inherit>
                  Ajouter des joueurs
                </Text>
              </Alert>
            ) : (
              <Checkbox.Group value={selectedIds} onChange={setSelectedIds}>
                <Stack gap="xs">
                  {players.map((player) => (
                    <Card key={player.id} withBorder padding="sm">
                      <Checkbox value={player.id} label={player.name} size="md" />
                    </Card>
                  ))}
                </Stack>
              </Checkbox.Group>
            )}

            {game && !countIsValid && players.length > 0 && (
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

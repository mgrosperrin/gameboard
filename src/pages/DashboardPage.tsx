import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { PlayIcon, PlusIcon, UsersIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

import { getGame } from '../games/registry';
import { useMatches } from '../storage/matchesStore';
import { usePlayers } from '../storage/playersStore';

export function DashboardPage() {
  const players = usePlayers();
  const matches = useMatches();
  const recentMatches = matches.slice(0, 5);

  return (
    <Stack gap="lg">
      <Title order={2}>Tableau de bord</Title>

      <Stack gap="sm">
        <Button
          component={Link}
          to="/matches/new"
          size="xl"
          leftSection={<PlusIcon size={22} />}
          fullWidth
        >
          Nouvelle partie
        </Button>
        <Button
          component={Link}
          to="/players"
          size="xl"
          variant="light"
          leftSection={<UsersIcon size={22} />}
          fullWidth
        >
          Joueurs ({players.length})
        </Button>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>Parties récentes</Title>
        {recentMatches.length === 0 ? (
          <Text c="dimmed" size="sm">
            Aucune partie pour le moment.
          </Text>
        ) : (
          recentMatches.map((match) => (
            <Card
              key={match.id}
              component={Link}
              to={`/matches/${match.id}`}
              withBorder
              padding="sm"
            >
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={600}>{getGame(match.gameId)?.name ?? match.gameId}</Text>
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {match.playerIds.map((id) => match.playerNames[id]).join(', ')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(match.createdAt).toLocaleString('fr-FR')}
                  </Text>
                </Stack>
                <Badge
                  color={match.finishedAt ? 'gray' : 'green'}
                  variant="light"
                  leftSection={match.finishedAt ? null : <PlayIcon size={12} />}
                >
                  {match.finishedAt ? 'Terminée' : 'En cours'}
                </Badge>
              </Group>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}

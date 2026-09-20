import { Badge, Card, Group, Stack, Text } from '@mantine/core';

import type { Player, PlayerScore } from '../domain/types';

interface ScoreboardProps {
  players: Player[];
  scores: PlayerScore[];
  lowerScoreWins?: boolean;
}

export function Scoreboard({ players, scores, lowerScoreWins = false }: ScoreboardProps) {
  const rows = players
    .map((player) => ({
      player,
      score: scores.find((score) => score.playerId === player.id)?.score ?? 0,
    }))
    .sort((a, b) => (lowerScoreWins ? a.score - b.score : b.score - a.score));

  return (
    <Card withBorder padding="sm">
      <Stack gap="xs">
        <Text fw={600}>Scores</Text>
        {rows.map((row, index) => (
          <Group key={row.player.id} justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <Badge variant="light" color={index === 0 ? 'yellow' : 'gray'} circle>
                {index + 1}
              </Badge>
              <Text>{row.player.name}</Text>
            </Group>
            <Text fw={700}>{row.score}</Text>
          </Group>
        ))}
      </Stack>
    </Card>
  );
}

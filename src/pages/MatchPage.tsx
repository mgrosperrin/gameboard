import { useMemo } from 'react';
import { Alert, Badge, Button, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { ArrowsClockwiseIcon, CheckIcon, TrashIcon } from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';

import { Scoreboard } from '../components/Scoreboard';
import type { Player } from '../domain/types';
import { getGame } from '../games/registry';
import {
  deleteMatch,
  finishMatch,
  reopenMatch,
  updateMatchState,
  useMatch,
} from '../storage/matchesStore';

export function MatchPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const match = useMatch(matchId);
  const game = getGame(match?.gameId);

  const players = useMemo<Player[]>(
    () =>
      match
        ? match.playerIds.map((id) => ({
            id,
            name: match.playerNames[id] ?? 'Joueur inconnu',
            createdAt: match.createdAt,
          }))
        : [],
    [match],
  );

  const scores = useMemo(
    () => (game && match ? game.computeScores(match.state, players) : []),
    [game, match, players],
  );

  if (!match || !game) {
    return <Alert color="red">Partie introuvable.</Alert>;
  }

  const isFinished = match.finishedAt !== null;
  const Board = game.Board;

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="nowrap">
        <Title order={2}>{game.name}</Title>
        <Badge color={isFinished ? 'gray' : 'green'} variant="light">
          {isFinished ? 'Terminée' : 'En cours'}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed">
        Démarrée le {new Date(match.createdAt).toLocaleString('fr-FR')}
      </Text>

      <Board
        players={players}
        state={match.state}
        setState={(next) =>
          updateMatchState(
            match.id,
            typeof next === 'function'
              ? (next as (previous: unknown) => unknown)(match.state)
              : next,
          )
        }
        scores={scores}
        isFinished={isFinished}
        finish={() => finishMatch(match.id)}
        reopen={() => reopenMatch(match.id)}
      />

      <Scoreboard players={players} scores={scores} lowerScoreWins={game.lowerScoreWins} />

      <Divider />

      <Stack gap="xs">
        {isFinished ? (
          <Button
            variant="light"
            leftSection={<ArrowsClockwiseIcon size={18} />}
            onClick={() => reopenMatch(match.id)}
          >
            Reprendre la partie
          </Button>
        ) : (
          <Button leftSection={<CheckIcon size={18} />} onClick={() => finishMatch(match.id)}>
            Terminer la partie
          </Button>
        )}
        <Button
          variant="subtle"
          color="red"
          leftSection={<TrashIcon size={18} />}
          onClick={() => {
            deleteMatch(match.id);
            navigate('/', { replace: true });
          }}
        >
          Supprimer la partie
        </Button>
      </Stack>
    </Stack>
  );
}

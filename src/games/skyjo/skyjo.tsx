import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { ArrowLeftIcon, ArrowRightIcon, FlagCheckeredIcon } from '@phosphor-icons/react';

import { selectableCardProps } from '../../components/selectableCardProps';
import type { GameBoardProps, GameDefinition } from '../types';

export interface SkyjoRound {
  scores: Record<string, number>;
  completedBy: string | null;
  scoreDoubled: boolean;
}

export interface SkyjoState {
  version: 3;
  rounds: SkyjoRound[];
}

const cardValues = Array.from({ length: 15 }, (_, index) => index - 2);
const cardImages = import.meta.glob<string>('./*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

function getRounds(state: SkyjoState): SkyjoRound[] {
  return Array.isArray(state.rounds) ? state.rounds : [];
}

function scoreCards(cards: Record<string, number[]>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(cards).map(([playerId, values]) => [
      playerId,
      values.reduce((total, value) => total + value, 0),
    ]),
  );
}

function totalCards(counts: Record<string, number> | undefined): number {
  return Object.values(counts ?? {}).reduce((total, count) => total + count, 0);
}

const maxCardsPerValue = 8;
const maxCardsPerPlayer = 12;
const doubleTapDelayMs = 350;
const headerOffset = 64;

// Évite le zoom du navigateur lors d'un double tap sur les cartes et les joueurs.
const tapTargetStyle = { touchAction: 'manipulation', userSelect: 'none' } as const;

function CardThumbnail({ value }: { value: number }) {
  return (
    <Image src={cardImages[`./${value}.png`]} alt={`Carte Skyjo ${value}`} h={80} fit="contain" />
  );
}

function currentTime(): number {
  return Date.now();
}

interface LastTap {
  key: string;
  time: number;
  added: boolean;
}

function SkyjoBoard({ players, setState, isFinished }: GameBoardProps<SkyjoState>) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedBy, setCompletedBy] = useState<string | null>(null);
  const [cardCounts, setCardCounts] = useState<Record<string, Record<string, number>>>(() =>
    Object.fromEntries(
      players.map((player) => [
        player.id,
        Object.fromEntries(cardValues.map((value) => [String(value), 0])),
      ]),
    ),
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const lastTap = useRef<LastTap | null>(null);

  // La saisie des cartes commence par le joueur ayant terminé la manche, puis suit l'ordre de jeu
  // en reprenant au début de la liste après le dernier joueur.
  const finisherIndex = players.findIndex((player) => player.id === completedBy);
  const orderedPlayers =
    finisherIndex === -1
      ? players
      : [...players.slice(finisherIndex), ...players.slice(0, finisherIndex)];
  const selectedPlayer = orderedPlayers[activeStep - 1];
  const selectedPlayerTotal = selectedPlayer ? totalCards(cardCounts[selectedPlayer.id]) : 0;

  // Ramène la saisie en haut de l'écran à chaque changement d'étape.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    cardRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [activeStep]);

  function selectCompletedBy(playerId: string) {
    setCompletedBy(playerId);
    setActiveStep(1);
  }

  function changeCount(playerId: string, value: number, delta: number) {
    setCardCounts((previous) => {
      const counts = previous[playerId] ?? {};
      const current = counts[String(value)] ?? 0;
      if (delta > 0 && totalCards(counts) >= maxCardsPerPlayer) {
        return previous;
      }
      const next = Math.min(maxCardsPerValue, Math.max(0, current + delta));
      return { ...previous, [playerId]: { ...counts, [String(value)]: next } };
    });
  }

  // Un tap ajoute une carte ; un double tap annule l'ajout du premier tap puis retire une carte.
  function tapCard(playerId: string, value: number) {
    const key = `${playerId}:${value}`;
    const now = currentTime();
    const previousTap = lastTap.current;
    const counts = cardCounts[playerId] ?? {};

    if (previousTap?.key === key && now - previousTap.time < doubleTapDelayMs) {
      lastTap.current = null;
      changeCount(playerId, value, previousTap.added ? -2 : -1);
      return;
    }

    const added =
      (counts[String(value)] ?? 0) < maxCardsPerValue && totalCards(counts) < maxCardsPerPlayer;
    lastTap.current = { key, time: now, added };
    changeCount(playerId, value, 1);
  }

  function addRound() {
    const cards = Object.fromEntries(
      players.map((player) => [
        player.id,
        Object.entries(cardCounts[player.id] ?? {}).flatMap(([value, count]) =>
          Array.from({ length: count }, () => Number(value)),
        ),
      ]),
    );
    const rawScores = scoreCards(cards);
    const scoreDoubled =
      completedBy !== null &&
      players.some(
        (player) => player.id !== completedBy && rawScores[player.id] <= rawScores[completedBy],
      );
    const scores = Object.fromEntries(
      players.map((player) => [
        player.id,
        player.id === completedBy && scoreDoubled ? rawScores[player.id] * 2 : rawScores[player.id],
      ]),
    );

    setState((previous) => ({
      ...previous,
      version: 3,
      rounds: [...getRounds(previous), { completedBy, scoreDoubled, scores }],
    }));
    setActiveStep(0);
    setCompletedBy(null);
    setCardCounts(
      Object.fromEntries(
        players.map((player) => [
          player.id,
          Object.fromEntries(cardValues.map((value) => [String(value), 0])),
        ]),
      ),
    );
  }

  return (
    <Card withBorder padding="sm" ref={cardRef} style={{ scrollMarginTop: headerOffset }}>
      <Stack gap="xs">
        <Progress value={((activeStep + 1) / (players.length + 1)) * 100} size="xs" />

        {selectedPlayer ? (
          <>
            <Group justify="space-between" wrap="nowrap">
              <Text fw={700} size="lg" truncate>
                {selectedPlayer.name}
              </Text>
              <Badge variant="light" size="lg">
                {selectedPlayerTotal} / {maxCardsPerPlayer} cartes
              </Badge>
            </Group>
            <SimpleGrid cols={3} spacing="xs" verticalSpacing="xs">
              {cardValues.map((value) => {
                const count = cardCounts[selectedPlayer.id]?.[String(value)] ?? 0;
                return (
                  <Card
                    key={value}
                    component="button"
                    type="button"
                    withBorder
                    padding={6}
                    pos="relative"
                    disabled={isFinished}
                    {...selectableCardProps(count > 0)}
                    style={{ ...tapTargetStyle, cursor: isFinished ? 'default' : 'pointer' }}
                    onClick={() => tapCard(selectedPlayer.id, value)}
                  >
                    <CardThumbnail value={value} />
                    {count > 0 && (
                      <Badge
                        pos="absolute"
                        top={4}
                        right={4}
                        size="lg"
                        circle
                        aria-label={`${count} en main`}
                      >
                        {count}
                      </Badge>
                    )}
                  </Card>
                );
              })}
            </SimpleGrid>
          </>
        ) : (
          <>
            <Text fw={700} size="lg">
              Qui a terminé la manche ?
            </Text>
            <SimpleGrid cols={2}>
              {players.map((player) => {
                const selected = completedBy === player.id;
                return (
                  <Card
                    key={player.id}
                    component="button"
                    type="button"
                    withBorder
                    padding="md"
                    disabled={isFinished}
                    aria-pressed={selected}
                    {...selectableCardProps(selected)}
                    style={{ ...tapTargetStyle, cursor: isFinished ? 'default' : 'pointer' }}
                    onClick={() => selectCompletedBy(player.id)}
                  >
                    <Text fw={selected ? 700 : 500} ta="center" truncate>
                      {player.name}
                    </Text>
                  </Card>
                );
              })}
            </SimpleGrid>
          </>
        )}

        {!isFinished && (
          <Group justify="space-between" mt="xs">
            <Button
              variant="default"
              leftSection={<ArrowLeftIcon size={18} />}
              disabled={activeStep === 0}
              onClick={() => setActiveStep((step) => step - 1)}
            >
              Précédent
            </Button>
            {activeStep === 0 && (
              <Button
                rightSection={<ArrowRightIcon size={18} />}
                disabled={completedBy === null}
                onClick={() => setActiveStep(1)}
              >
                Suivant
              </Button>
            )}
            {activeStep > 0 && activeStep < players.length && (
              <Button
                rightSection={<ArrowRightIcon size={18} />}
                onClick={() => setActiveStep((step) => step + 1)}
              >
                Suivant
              </Button>
            )}
            {activeStep === players.length && (
              <Button leftSection={<FlagCheckeredIcon size={18} />} onClick={addRound}>
                Terminer
              </Button>
            )}
          </Group>
        )}

        <Text size="xs" c="dimmed" ta="center">
          Étape {activeStep + 1} / {players.length + 1} ·{' '}
          {selectedPlayer
            ? 'Tap : ajouter une carte · Double tap : en retirer une'
            : 'Touchez le joueur qui a terminé : la saisie des cartes commencera par lui. Les points sont calculés automatiquement.'}
        </Text>
      </Stack>
    </Card>
  );
}

function SkyjoDetails({ players, state }: GameBoardProps<SkyjoState>) {
  const rounds = getRounds(state);

  if (rounds.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        Aucune manche enregistrée.
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      <Text fw={600}>Manches enregistrées</Text>
      {rounds.map((round, roundIndex) => (
        <Card key={roundIndex} withBorder padding="sm">
          <Group justify="space-between" wrap="nowrap">
            <Text fw={500}>Manche {roundIndex + 1}</Text>
            <Group gap="xs">
              {round.scoreDoubled && <Badge color="orange">Score doublé</Badge>}
              <Text size="sm" c="dimmed">
                {round.completedBy
                  ? `Terminée par ${players.find((player) => player.id === round.completedBy)?.name ?? 'un joueur'}`
                  : 'Sans joueur terminant'}
              </Text>
            </Group>
          </Group>
          <Divider my="xs" />
          <SimpleGrid cols={{ base: 2, sm: 3 }}>
            {players.map((player) => (
              <Text key={player.id} size="sm">
                {player.name} : {round.scores[player.id] ?? 0}
              </Text>
            ))}
          </SimpleGrid>
        </Card>
      ))}
    </Stack>
  );
}

export const skyjo: GameDefinition<SkyjoState> = {
  id: 'skyjo',
  name: 'Skyjo',
  description: 'Cumulez le moins de points possible au fil des manches.',
  minPlayers: 2,
  maxPlayers: 8,
  lowerScoreWins: true,
  createInitialState: () => ({ version: 3, rounds: [] }),
  computeScores: (state, players) =>
    players.map((player) => ({
      playerId: player.id,
      score: getRounds(state).reduce((total, round) => total + (round.scores[player.id] ?? 0), 0),
    })),
  showScoreboard: (state) => getRounds(state).length > 0,
  Board: SkyjoBoard,
  Details: SkyjoDetails,
};

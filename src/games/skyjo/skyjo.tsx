import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Image,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
} from '@mantine/core';
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from '@phosphor-icons/react';

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

function CardThumbnail({ value }: { value: number }) {
  return (
    <Image src={cardImages[`./${value}.png`]} alt={`Carte Skyjo ${value}`} h={108} fit="contain" />
  );
}

function SkyjoBoard({ players, state, setState, isFinished }: GameBoardProps<SkyjoState>) {
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

  const selectedPlayer = players[activeStep - 1];
  const selectedPlayerTotal = selectedPlayer ? totalCards(cardCounts[selectedPlayer.id]) : 0;
  const selectedPlayerHasTooManyCards = selectedPlayerTotal >= 12;

  function setCount(playerId: string, value: number, count: number | string) {
    setCardCounts((previous) => ({
      ...previous,
      [playerId]: {
        ...previous[playerId],
        [String(value)]: typeof count === 'number' ? count : 0,
      },
    }));
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
    <Stack gap="md">
      <Alert color="blue" variant="light">
        Sélectionnez le joueur qui a terminé, puis le nombre de cartes restantes pour chaque valeur.
        Les points sont calculés automatiquement.
      </Alert>

      <Card withBorder padding="sm">
        <Stepper active={activeStep} onStepClick={isFinished ? undefined : setActiveStep}>
          <Stepper.Step label="Fin de manche" description="Joueur terminant">
            <Stack gap="sm" mt="md">
              <Text fw={600}>Qui a terminé la manche ?</Text>
              <NativeSelect
                label="Joueur terminant"
                disabled={isFinished}
                value={completedBy ?? ''}
                data={[
                  { value: '', label: 'Sélectionner un joueur' },
                  ...players.map((player) => ({ value: player.id, label: player.name })),
                ]}
                onChange={(event) => setCompletedBy(event.currentTarget.value || null)}
              />
            </Stack>
          </Stepper.Step>

          {players.map((player) => (
            <Stepper.Step key={player.id} label={player.name} description="Cartes restantes">
              {selectedPlayer?.id === player.id && (
                <Stack gap="sm" mt="md">
                  <Text size="sm" c="dimmed">
                    Pour chaque carte, indiquez combien il en reste dans le jeu de {player.name}.
                  </Text>
                  <Alert color={selectedPlayerHasTooManyCards ? 'red' : 'gray'} variant="light">
                    Total sélectionné : {selectedPlayerTotal} / 11 cartes maximum.
                    {selectedPlayerHasTooManyCards && ' Le total doit être inférieur à 12.'}
                  </Alert>
                  <SimpleGrid cols={{ base: 2, xs: 3, sm: 5 }}>
                    {cardValues.map((value) => (
                      <Card key={value} withBorder padding="xs">
                        <Stack gap="xs">
                          <CardThumbnail value={value} />
                          <NumberInput
                            label="Nombre"
                            min={0}
                            max={8}
                            allowDecimal={false}
                            inputMode="numeric"
                            disabled={isFinished}
                            value={cardCounts[player.id]?.[String(value)] ?? 0}
                            onChange={(count) => setCount(player.id, value, count)}
                          />
                        </Stack>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Stack>
              )}
            </Stepper.Step>
          ))}

          <Stepper.Completed>
            <Alert color="green" mt="md">
              Toutes les cartes ont été saisies. Vérifiez le récapitulatif puis ajoutez la manche.
            </Alert>
          </Stepper.Completed>
        </Stepper>

        {!isFinished && (
          <Group justify="space-between" mt="lg">
            <Button
              variant="default"
              leftSection={<ArrowLeftIcon size={18} />}
              disabled={activeStep === 0}
              onClick={() => setActiveStep((step) => step - 1)}
            >
              Précédent
            </Button>
            {activeStep < players.length ? (
              <Button
                rightSection={<ArrowRightIcon size={18} />}
                disabled={
                  (activeStep === 0 && completedBy === null) || selectedPlayerHasTooManyCards
                }
                onClick={() => setActiveStep((step) => step + 1)}
              >
                Suivant
              </Button>
            ) : (
              <Button leftSection={<PlusIcon size={18} />} onClick={addRound}>
                Ajouter la manche
              </Button>
            )}
          </Group>
        )}
      </Card>

      {getRounds(state).length > 0 && (
        <Stack gap="xs">
          <Text fw={600}>Manches enregistrées</Text>
          {getRounds(state).map((round, roundIndex) => (
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
      )}
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
  Board: SkyjoBoard,
};

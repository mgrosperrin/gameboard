import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { PencilIcon, TrashIcon, UserPlusIcon } from '@phosphor-icons/react';

import type { Player } from '../domain/types';
import {
  addPlayer,
  deletePlayer,
  playerNameExists,
  renamePlayer,
  usePlayers,
} from '../storage/playersStore';

export function PlayersPage() {
  const players = usePlayers();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Player | null>(null);
  const [editedName, setEditedName] = useState('');
  const [modalOpened, modal] = useDisclosure(false);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Le nom est obligatoire.');
      return;
    }
    if (playerNameExists(trimmed)) {
      setError('Ce joueur existe déjà.');
      return;
    }
    addPlayer(trimmed);
    setName('');
    setError(null);
  };

  const openEdit = (player: Player) => {
    setEditing(player);
    setEditedName(player.name);
    modal.open();
  };

  const handleRename = () => {
    if (!editing) return;
    const trimmed = editedName.trim();
    if (!trimmed || playerNameExists(trimmed, editing.id)) {
      notifications.show({ color: 'red', message: 'Nom invalide ou déjà utilisé.' });
      return;
    }
    renamePlayer(editing.id, trimmed);
    modal.close();
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Joueurs</Title>

      <Group align="flex-start" gap="xs" wrap="nowrap">
        <TextInput
          flex={1}
          placeholder="Nom du joueur"
          value={name}
          error={error}
          onChange={(event) => {
            setName(event.currentTarget.value);
            setError(null);
          }}
          onKeyDown={(event) => event.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} leftSection={<UserPlusIcon size={18} />}>
          Ajouter
        </Button>
      </Group>

      {players.length === 0 ? (
        <Text c="dimmed" size="sm">
          Aucun joueur enregistré.
        </Text>
      ) : (
        <Stack gap="xs">
          {players.map((player) => (
            <Card key={player.id} withBorder padding="sm">
              <Group justify="space-between" wrap="nowrap">
                <Text fw={500}>{player.name}</Text>
                <Group gap={4} wrap="nowrap">
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Renommer ${player.name}`}
                    onClick={() => openEdit(player)}
                  >
                    <PencilIcon size={18} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Supprimer ${player.name}`}
                    onClick={() => deletePlayer(player.id)}
                  >
                    <TrashIcon size={18} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Modal opened={modalOpened} onClose={modal.close} title="Renommer le joueur" centered>
        <Stack>
          <TextInput
            value={editedName}
            onChange={(event) => setEditedName(event.currentTarget.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleRename()}
            data-autofocus
          />
          <Button onClick={handleRename}>Enregistrer</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}

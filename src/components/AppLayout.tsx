import { ActionIcon, AppShell, Container, Group, Text, useMantineColorScheme } from '@mantine/core';
import { ArrowLeftIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isHome = pathname === '/';

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            {!isHome && (
              <ActionIcon
                variant="subtle"
                size="lg"
                aria-label="Retour"
                onClick={() => navigate(-1)}
              >
                <ArrowLeftIcon size={20} />
              </ActionIcon>
            )}
            <Text component={Link} to="/" fw={700} size="lg" td="none" c="inherit">
              Gameboard
            </Text>
          </Group>
          <ActionIcon
            variant="subtle"
            size="lg"
            aria-label="Changer de thème"
            onClick={toggleColorScheme}
          >
            {colorScheme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xs" px={0}>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

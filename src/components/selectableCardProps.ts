/** Bordure de même épaisseur sélectionnée ou non, pour ne pas décaler les éléments voisins. */
export function selectableCardProps(selected: boolean) {
  return {
    bd: `2px solid ${selected ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-default-border)'}`,
    bg: selected ? 'var(--mantine-primary-color-light)' : undefined,
  };
}

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom ne fournit pas matchMedia, requis par Mantine.
const noop = () => {};
vi.stubGlobal('matchMedia', (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: noop,
  removeEventListener: noop,
  addListener: noop,
  removeListener: noop,
  dispatchEvent: () => false,
}));

// Le global `localStorage` de Node masque celui de jsdom : on fournit notre propre implémentation.
const storage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  get length() {
    return storage.size;
  },
  key: (index: number) => [...storage.keys()][index] ?? null,
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => void storage.set(key, String(value)),
  removeItem: (key: string) => void storage.delete(key),
  clear: () => storage.clear(),
} satisfies Storage);

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

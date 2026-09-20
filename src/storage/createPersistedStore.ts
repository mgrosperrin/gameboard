import { useSyncExternalStore } from 'react';

export interface PersistedStore<T> {
  get: () => T;
  set: (next: T | ((previous: T) => T)) => void;
  use: () => T;
}

/**
 * Minimal store persisted in localStorage and shared by every component that reads it.
 */
export function createPersistedStore<T>(key: string, initialValue: T): PersistedStore<T> {
  const listeners = new Set<() => void>();

  const read = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  };

  let value = read();

  const emit = () => listeners.forEach((listener) => listener());

  const get = () => value;

  const set = (next: T | ((previous: T) => T)) => {
    value = typeof next === 'function' ? (next as (previous: T) => T)(value) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable: keep the in-memory value.
    }
    emit();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  window.addEventListener('storage', (event) => {
    if (event.key !== key) return;
    value = read();
    emit();
  });

  return {
    get,
    set,
    use: () => useSyncExternalStore(subscribe, get, get),
  };
}

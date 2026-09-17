"use client";
import { useMemo, useSyncExternalStore } from 'react';
const KEY = 'pet-favorites';
const listeners = new Set<() => void>();
let memory = '[]';
let blocked = false;
const serverSnapshot = () => '[]';
function getSnapshot() {
  if (blocked) return memory;
  try { return localStorage.getItem(KEY) || '[]'; } catch { return memory; }
}
export function parseFavorites(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(id)))].slice(0, 200) : [];
  } catch { return []; }
}
function notify() { listeners.forEach(listener => listener()); }
function onStorage(event: StorageEvent) { if (event.key === KEY || event.key === null) notify(); }
function subscribe(listener: () => void) {
  if (!listeners.size) {
    window.addEventListener('favorites-changed', notify);
    window.addEventListener('storage', onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.removeEventListener('favorites-changed', notify);
      window.removeEventListener('storage', onStorage);
    }
  };
}
export function toggleFavorite(id: string) {
  const ids = parseFavorites(getSnapshot());
  memory = JSON.stringify(ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id].slice(-200));
  try { localStorage.setItem(KEY, memory); blocked = false; } catch { blocked = true; }
  window.dispatchEvent(new Event('favorites-changed'));
}
export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  return useMemo(() => parseFavorites(raw), [raw]);
}
const clientReady = () => true;
const serverReady = () => false;
export function useFavoritesReady() {
  return useSyncExternalStore(subscribe, clientReady, serverReady);
}

'use client';

import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';
function subscribe(notify: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => false;

/** Keep interactive motion in sync when the OS preference changes mid-visit. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

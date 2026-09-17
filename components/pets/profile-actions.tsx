'use client';

import { Heart, RotateCcw } from 'lucide-react';
import { toggleFavorite, useFavorites, useFavoritesReady } from '@/lib/pets/favorites';

export function ProfileFavorite({ id, name }: { id: string; name: string }) {
  const saved = useFavorites().includes(id);
  const ready = useFavoritesReady();
  return <button type="button" className="pet-profile__favorite" disabled={!ready} aria-pressed={saved} aria-label={`${saved ? 'Убрать из любимчиков' : 'Добавить в любимчики'}: ${name}`} onClick={() => toggleFavorite(id)}><Heart size={20} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} /><span>{saved ? 'В любимчиках' : 'В любимчики'}</span></button>;
}

export function ProfileRetry() {
  return <button type="button" className="pet-profile__button" onClick={() => window.location.reload()}><RotateCcw size={18} aria-hidden="true" />Попробовать снова</button>;
}

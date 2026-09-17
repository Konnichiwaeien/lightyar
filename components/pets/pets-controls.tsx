"use client";
import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown, ChevronDown, Heart, Home, PawPrint, RotateCcw, Ruler, Search, SlidersHorizontal, VenusAndMars, X } from 'lucide-react';
import { useFavorites, useFavoritesReady } from '@/lib/pets/favorites';

export function PetsControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const favorites = useFavorites();
  const favoritesReady = useFavoritesReady();
  const [pending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const status = params.get('status') === 'home' ? 'home' : 'shelter';
  const isFavorites = params.get('favorites') === 'true';
  const query = params.toString();
  const nextQuery = useRef(query);
  // Each event starts from the latest intent, even while an earlier navigation is pending.
  useEffect(() => { if (!pending) nextQuery.current = query; }, [query, pending]);
  const navigate = (updates: Record<string, string | null>, replace = false) => {
    const next = new URLSearchParams(nextQuery.current);
    Object.entries(updates).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    next.delete('page');
    nextQuery.current = next.toString();
    const href = `${pathname}${next.size ? `?${next}` : ''}`;
    startTransition(() => { if (replace) router.replace(href, { scroll: false }); else router.push(href, { scroll: false }); });
  };
  const favoriteKey = favorites.join(',');
  // Wait until hydration has read localStorage before reconciling a shared favorite URL.
  useEffect(() => {
    if (!favoritesReady || !isFavorites || (params.get('ids') || '') === favoriteKey) return;
    const next = new URLSearchParams(query);
    if (favoriteKey) next.set('ids', favoriteKey); else next.delete('ids');
    next.delete('page');
    nextQuery.current = next.toString();
    startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }));
  }, [favoriteKey, favoritesReady, isFavorites, params, pathname, query, router]);
  const active = ['type','sex','size','search','favorites'].some(key => params.has(key));
  const filterCount = ['type','sex','size'].filter(key => params.has(key)).length + (params.has('sort') && params.get('sort') !== 'name_asc' ? 1 : 0);
  return (
    <div className="pets-controls" aria-busy={pending}>
      <div className="pets-controls__top">
        <SearchForm key={params.get('search') || ''} initial={params.get('search') || ''} onSearch={value => navigate({search: value.trim()})} />
        <div className="pets-status" role="group" aria-label="Где сейчас питомец">
          <button type="button" aria-pressed={status === 'shelter'} onClick={() => navigate({status: null})}><PawPrint size={17} aria-hidden="true" />Ищут дом</button>
          <button type="button" aria-pressed={status === 'home'} onClick={() => navigate({status: 'home'})}><Home size={17} aria-hidden="true" />Уже дома</button>
        </div>
      </div>
      <div className="pets-controls__mobile">
        <button className="pets-filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="pets-filter-panel" onClick={()=>setFiltersOpen(value=>!value)}><SlidersHorizontal size={18} aria-hidden="true" />Фильтры и порядок{filterCount>0 && <span>{filterCount}</span>}<ChevronDown size={15} aria-hidden="true" /></button>
        <button type="button" className="pets-favorites" aria-pressed={isFavorites} onClick={() => navigate({favorites: isFavorites ? null : 'true', ids: isFavorites ? null : favoriteKey})}><Heart size={18} fill={isFavorites ? 'currentColor' : 'none'} aria-hidden="true" /><span className="sr-only">Любимчики </span>{favorites.length}</button>
      </div>
      <div className="pets-controls__disclosure" id="pets-filter-panel" data-open={filtersOpen}><div className="pets-controls__clip"><div className="pets-controls__fields">
        <span className="pets-controls__caption"><SlidersHorizontal size={17} aria-hidden="true" />Фильтры</span>
        <label className="pets-select"><span className="sr-only">Кого ищете</span><PawPrint aria-hidden="true" size={17} /><select value={params.get('type') || ''} onChange={event => navigate({type:event.target.value})}><option value="">Все виды</option><option value="dog">Собаки</option><option value="cat">Кошки</option></select><ChevronDown size={14} aria-hidden="true" /></label>
        <label className="pets-select"><span className="sr-only">Пол</span><VenusAndMars size={17} aria-hidden="true" /><select value={params.get('sex') || ''} onChange={event => navigate({sex:event.target.value})}><option value="">Любой пол</option><option value="male">Мальчики</option><option value="female">Девочки</option></select><ChevronDown size={14} aria-hidden="true" /></label>
        <label className="pets-select"><span className="sr-only">Размер</span><Ruler size={17} aria-hidden="true" /><select value={params.get('size') || ''} onChange={event => navigate({size:event.target.value})}><option value="">Любой размер</option><option value="small">Маленькие</option><option value="medium">Средние</option><option value="large">Большие</option></select><ChevronDown size={14} aria-hidden="true" /></label>
        <button type="button" className="pets-favorites pets-favorites--desktop" aria-pressed={isFavorites} onClick={() => navigate({favorites: isFavorites ? null : 'true', ids: isFavorites ? null : favoriteKey})}>
          <Heart size={18} fill={isFavorites ? 'currentColor' : 'none'} aria-hidden="true" /> Любимчики <span>{favorites.length}</span>
        </button>
        <label className="pets-select pets-select--sort"><span className="sr-only">Порядок</span><ArrowUpDown size={17} aria-hidden="true" /><select value={params.get('sort') || 'name_asc'} onChange={event => navigate({sort:event.target.value})}><option value="name_asc">По имени А–Я</option><option value="name_desc">По имени Я–А</option><option value="age_asc">Сначала младшие</option><option value="age_desc">Сначала старшие</option></select><ChevronDown size={14} aria-hidden="true" /></label>
      </div></div></div>
      <div className="pets-controls__feedback" data-active={active}>
        <span role="status" aria-live="polite">{pending ? 'Ищем питомцев…' : ''}</span>
        {active && <button type="button" className="pets-text-link" onClick={() => navigate({type:null,sex:null,size:null,search:null,favorites:null,ids:null})}><RotateCcw size={16} aria-hidden="true" />Сбросить фильтры</button>}
      </div>
    </div>
  );
}
function SearchForm({initial,onSearch}:{initial:string;onSearch:(value:string)=>void}) {
  const [value,setValue] = useState(initial);
  return <form role="search" onSubmit={event => {event.preventDefault();onSearch(value);}} className="pets-search">
    <label htmlFor="pet-search" className="sr-only">Имя питомца</label>
    <div><Search size={20} aria-hidden="true" /><input id="pet-search" type="search" value={value} onChange={event => setValue(event.target.value)} placeholder="Имя питомца" maxLength={100} />{value && <button type="button" className="pets-search__clear" aria-label="Очистить поиск" onClick={() => {setValue('');onSearch('');}}><X size={17} aria-hidden="true" /></button>}<button className="pets-search__submit" type="submit" aria-label="Найти питомца"><Search size={17} aria-hidden="true" />Найти</button></div>
  </form>;
}

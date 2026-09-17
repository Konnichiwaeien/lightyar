import type { PetsQueryOptions } from '../api/services/pets';
export type CatalogSearch = Record<string, string | string[] | undefined>;
const SORTS: Record<string, string> = { name_asc: 'name:asc', name_desc: 'name:desc', age_asc: 'birthDate:desc', age_desc: 'birthDate:asc' };
export const PETS_PER_PAGE = 12;

export function parseCatalogQuery(params: CatalogSearch): { page: number; favorites: boolean; options: PetsQueryOptions } {
  const value = (key: string) => typeof params[key] === 'string' ? params[key] as string : '';
  const number = Number(value('page') || 1);
  const page = Number.isSafeInteger(number) && number > 0 ? Math.min(number, 10000) : 1;
  const status = value('status') === 'home' ? 'home' : 'shelter';
  const type = value('type');
  const sex = value('sex');
  const size = value('size');
  const favorites = value('favorites') === 'true';
  return {
    page, favorites,
    options: {
      status: status as 'home' | 'shelter',
      type: type === 'dog' || type === 'cat' ? type : undefined,
      sex: sex === 'male' || sex === 'female' ? sex : undefined,
      size: size === 'small' || size === 'medium' || size === 'large' ? size : undefined,
      search: value('search').trim().slice(0, 100) || undefined,
      sort: SORTS[value('sort')] || SORTS.name_asc,
      ids: favorites ? [...new Set(value('ids').split(',').filter(id => /^[a-zA-Z0-9_-]{1,64}$/.test(id)))].slice(0, 200) : undefined,
      limit: PETS_PER_PAGE,
      start: (page - 1) * PETS_PER_PAGE,
    },
  };
}
export function catalogCanonical(params: CatalogSearch) {
  const { page, options } = parseCatalogQuery(params);
  const query = new URLSearchParams();
  if (options.status === 'home') query.set('status', 'home');
  if (page > 1) query.set('page', String(page));
  return `/pets${query.size ? `?${query}` : ''}`;
}
export function hasCatalogFilters(params: CatalogSearch) {
  return ['type', 'sex', 'size', 'search', 'favorites', 'ids', 'sort'].some(key => Boolean(params[key]));
}

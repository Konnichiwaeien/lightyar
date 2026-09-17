import type { StrapiPet } from '../api/types';

export function profileAge(birthDate?: string, now = new Date()): string {
  if (!birthDate) return 'Возраст уточняется';
  const birth = new Date(birthDate);
  if (!Number.isFinite(birth.getTime()) || birth > now) return 'Возраст уточняется';
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth() - (now.getDate() < birth.getDate() ? 1 : 0);
  if (months < 1) return 'Меньше месяца';
  const plural = (n: number, forms: string[]) => forms[n % 100 >= 11 && n % 100 <= 14 ? 2 : n % 10 === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 ? 1 : 2];
  const years = Math.floor(months / 12);
  return years ? `${years} ${plural(years, ['год', 'года', 'лет'])}` : `${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`;
}

export function profileDescription(pet: StrapiPet): string {
  const text = pet.shortDescr || pet.descr || `${pet.name} — ${pet.type === 'dog' ? 'собака' : 'кошка'} приюта «Светлый» в Ярославле. ${pet.petStatus === 'home' ? 'Уже дома.' : 'Фотографии и знакомство с питомцем.'}`;
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
}

export function profileRatings(pet: StrapiPet) {
  return [
    { key: 'activity', label: 'Активность', value: pet.activity },
    { key: 'friendliness', label: 'Общительность', value: pet.friendliness },
    { key: 'trainability', label: 'Обучаемость', value: pet.trainability },
  ].filter((item): item is { key: string; label: string; value: number } => typeof item.value === 'number' && Number.isInteger(item.value) && item.value >= 1 && item.value <= 5);
}

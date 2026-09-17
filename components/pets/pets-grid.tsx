import Link from 'next/link';
import type { MappedPet } from '@/lib/helpers/pets/normalize-pet-data';
import { PetCard } from './pet-card';
export function PetsGrid({pets,favorites}:{pets:MappedPet[];favorites:boolean}) {
  if (!pets.length) return <div className="pets-empty"><h3>{favorites ? 'Здесь будут ваши любимчики' : 'Таких питомцев пока не нашли'}</h3><p>{favorites ? 'Нажмите на сердечко на фотографии питомца, чтобы сохранить его здесь. Если вы уже кого-то сохранили, попробуйте сбросить фильтры.' : 'Попробуйте другое имя или уберите часть фильтров.'}</p><Link className="pets-text-link" href="/pets#pets-catalog">Показать всех питомцев</Link></div>;
  return <ul className="pets-grid" aria-label="Питомцы приюта">{pets.map(pet => <PetCard key={pet.id} pet={pet} />)}</ul>;
}

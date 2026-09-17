import Link from 'next/link';
import { ArrowLeft, PawPrint } from 'lucide-react';
import { InnerHeader } from '@/components/layout/inner-header';
import '@/components/pets/pet-profile.css';

export default function PetNotFound() {
  return <div className="pet-profile"><InnerHeader /><main id="main-content" className="pet-profile__container pet-profile__section pet-profile__unavailable"><PawPrint size={32} aria-hidden="true" /><h1>Питомец не найден</h1><p>Возможно, ссылка устарела. Посмотрите, кто сейчас есть в каталоге.</p><Link href="/pets" className="pet-profile__button"><ArrowLeft size={18} aria-hidden="true" />Все питомцы</Link></main></div>;
}

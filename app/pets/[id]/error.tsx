'use client';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { InnerHeader } from '@/components/layout/inner-header';
import '@/components/pets/pet-profile.css';

export default function PetError({ reset }: { reset: () => void }) {
  return <div className="pet-profile"><InnerHeader /><main id="main-content" className="pet-profile__container pet-profile__section pet-profile__unavailable"><h1>Не удалось загрузить страницу</h1><p>Попробуйте ещё раз или вернитесь к каталогу.</p><button type="button" className="pet-profile__button" onClick={reset}><RotateCcw size={18} aria-hidden="true" />Попробовать снова</button><Link href="/pets" className="pet-profile__text-link">Все питомцы</Link></main></div>;
}

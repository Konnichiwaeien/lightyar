"use client";
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowUpRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, GraduationCap, Heart, Home, Info, Mars, PawPrint, Ruler, Venus, Zap } from 'lucide-react';
import type { MappedPet } from '@/lib/helpers/pets/normalize-pet-data';
import { formatAge } from '@/lib/helpers/pets/format-age';
import { toggleFavorite, useFavorites } from '@/lib/pets/favorites';
import { ResilientImage } from '@/components/ui/resilient-image';

export function PetCard({pet}:{pet:MappedPet}) {
  const favorites = useFavorites();
  const favorite = favorites.includes(pet.id);
  const [photo,setPhoto] = useState(0);
  const [expanded,setExpanded] = useState(false);
  const touch = useRef<number | null>(null);
  const images = pet.images.length ? pet.images : [pet.image];
  const changePhoto = (delta:number) => setPhoto(value => (value + delta + images.length) % images.length);
  return <li className="pet-entry">
    <article aria-labelledby={`pet-name-${pet.id}`}>
      <div className="pet-entry__photo" onTouchStart={event => {touch.current = event.touches[0].clientX;}} onTouchEnd={event => {
        if(touch.current !== null && images.length > 1) {
          const delta = touch.current - event.changedTouches[0].clientX;
          if(Math.abs(delta) > 45) changePhoto(delta > 0 ? 1 : -1);
        }
        touch.current = null;
      }}>
        <Link href={`/pets/${pet.slug || pet.id}`} tabIndex={-1} aria-hidden="true" prefetch={false}>
          <ResilientImage src={images[photo]} alt={`${pet.name}, ${pet.species.toLowerCase()}`} fill sizes="(max-width: 599px) calc(100vw - 40px), (max-width: 999px) 46vw, 30vw" className="pet-entry__image" loading="lazy" />
        </Link>
        <span className="pet-entry__status" data-home={pet.status === 'home'}>{pet.status === 'home' ? <Home size={15} aria-hidden="true" /> : <PawPrint size={15} aria-hidden="true" />}{pet.status === 'home' ? 'Уже дома' : 'Ищет дом'}</span>
        <button className="pet-entry__favorite" type="button" aria-pressed={favorite} aria-label={`${favorite ? 'Убрать из любимчиков' : 'В любимчики'}: ${pet.name}`} onClick={() => toggleFavorite(pet.id)}><Heart size={21} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" /></button>
        {images.length > 1 && <div className="pet-entry__photos">
          <button type="button" onClick={() => changePhoto(-1)} aria-label={`Предыдущее фото: ${pet.name}`}><ChevronLeft size={19} aria-hidden="true" /></button>
          <span aria-live="polite" aria-atomic="true"><span className="sr-only">{pet.name}, фото </span>{photo+1} / {images.length}</span>
          <button type="button" onClick={() => changePhoto(1)} aria-label={`Следующее фото: ${pet.name}`}><ChevronRight size={19} aria-hidden="true" /></button>
        </div>}
      </div>
      <div className="pet-entry__body">
      <div className="pet-entry__title">
        <h2 id={`pet-name-${pet.id}`}><Link href={`/pets/${pet.slug || pet.id}`} prefetch={false}>{pet.name}<ArrowUpRight aria-hidden="true" size={24} /></Link></h2>
        <span className="pet-entry__species">{pet.species}</span>
      </div>
      <ul className="pet-entry__badges" aria-label={`Коротко о питомце ${pet.name}`}>
        <li className="pet-badge pet-badge--age"><CalendarDays size={14} aria-hidden="true" />{formatAge(pet.age)}</li>
        <li className="pet-badge" data-gender={pet.gender === 'Мальчик' ? 'male' : pet.gender === 'Девочка' ? 'female' : undefined}>{pet.gender === 'Мальчик' ? <Mars size={14} aria-hidden="true" /> : pet.gender === 'Девочка' ? <Venus size={14} aria-hidden="true" /> : <Info size={14} aria-hidden="true" />}{pet.gender}</li>
        <li className="pet-badge pet-badge--breed"><PawPrint size={14} aria-hidden="true" />{pet.breed}</li>
        <li className="pet-badge"><Ruler size={14} aria-hidden="true" />{{small:'Маленький',medium:'Средний',large:'Большой'}[pet.size]}</li>
        {pet.colorName && <li className="pet-badge"><span className="pet-badge__color" style={{backgroundColor:pet.colorHex || '#b7ad9f'}} aria-hidden="true" />{pet.colorName}</li>}
      </ul>
      <p className="pet-entry__description">{pet.description}</p>
      <div className="pet-entry__details" data-open={expanded}><button className="pet-entry__details-toggle" type="button" aria-expanded={expanded} aria-controls={`pet-traits-${pet.id}`} onClick={() => setExpanded(value => !value)}><Info size={17} aria-hidden="true" />Характер и привычки<ChevronDown size={15} aria-hidden="true" /></button><div className="pet-entry__details-panel" id={`pet-traits-${pet.id}`} aria-hidden={!expanded} inert={!expanded}><div><div className="pet-entry__traits">
        {([{key:'activity',label:'Активность',icon:Zap},{key:'friendliness',label:'Общительность',icon:Heart},{key:'trainability',label:'Обучаемость',icon:GraduationCap}] as const).map(({key,label,icon:Icon}) => {
          const value = pet.characteristics?.[key];
          return <div className="pet-trait" key={key}><span><Icon size={15} aria-hidden="true" />{label}</span>{value ? <span className="pet-trait__rating" role="img" aria-label={`${value} из 5`}>{[1,2,3,4,5].map(level => <i key={level} data-filled={level <= value} aria-hidden="true" />)}</span> : <span className="pet-trait__unknown">Уточним при встрече</span>}</div>;
        })}
        <p>Спросите куратора, что питомец любит и как ладит с людьми и другими животными.</p>
      </div></div></div></div>
      <Link className="pet-entry__cta" href={`/pets/${pet.slug || pet.id}`} prefetch={false} aria-label={`${pet.status === 'home' ? 'История' : 'Познакомиться'}: ${pet.name}`}>{pet.status === 'home' ? <Home size={18} aria-hidden="true" /> : <PawPrint size={18} aria-hidden="true" />}{pet.status === 'home' ? 'История питомца' : 'Познакомиться'}<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </article>
  </li>;
}

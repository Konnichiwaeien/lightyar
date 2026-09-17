import { cache, Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ProfilePhoto } from '@/components/pets/profile-photo';
import { notFound, permanentRedirect } from 'next/navigation';
import { connection } from 'next/server';
import { ArrowLeft, ArrowDown, ArrowUpRight, BookOpenText, CalendarDays, Heart, HeartHandshake, Home, Info, MapPin, Mars, MessageCircle, PawPrint, Ruler, ScanHeart, ShieldCheck, Sparkles, Venus, Weight, Zap, GraduationCap } from 'lucide-react';
import { ProfileSupport } from '@/components/pets/profile-support';
import { InnerHeader } from '@/components/layout/inner-header';
import { ProfileGallery } from '@/components/pets/profile-gallery';
import { ProfileFavorite, ProfileRetry } from '@/components/pets/profile-actions';
import { petsService } from '@/lib/api/services/pets';
import { profileAge, profileDescription, profileRatings } from '@/lib/pets/profile';
import { siteUrl } from '@/lib/seo/site';
import '@/components/pets/pet-profile.css';

interface PageProps { params: Promise<{ id: string }> }
const getPet = cache((id: string) => petsService.getPetByIdOrSlug(id));
const contactUrl = 'https://vk.com/im?sel=-228082117';
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Metadata must not prevent the route's retry UI from rendering during a CMS outage.
  const pet = await getPet((await params).id).catch(() => null);
  if (!pet) return { title: 'Питомец не найден', robots: { index: false, follow: true } };
  const title = `${pet.name} — ${pet.petStatus === 'home' ? 'уже дома' : 'знакомство с питомцем'} | Приют «Светлый»`;
  const description = profileDescription(pet);
  const url = siteUrl(`/pets/${pet.slug || pet.documentId}`);
  const images = pet.photos?.[0] ? [{ url: petsService.resolveMediaUrl(pet.photos[0].url), alt: pet.name }] : [];
  return { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', locale: 'ru_RU', images }, twitter: { card: images.length ? 'summary_large_image' : 'summary', title, description, images: images.map(image => image.url) } };
}
async function RelatedPets({ id }: { id: string }) {
  // Secondary content streams without delaying the portrait.
  const pets = await petsService.getPets({ status: 'shelter', limit: 4, sort: 'name:asc' }).catch(() => null);
  const others = pets?.filter(pet => pet.documentId !== id).slice(0, 3);
  if (!others?.length) return null;
  return <section className="pet-profile__related pet-profile__section" aria-labelledby="related-heading"><div className="pet-profile__container">
    <div className="pet-profile__section-heading"><h2 id="related-heading">Ещё несколько <em>знакомств</em></h2><Link href="/pets" className="pet-profile__button pet-profile__button--white">Все питомцы <ArrowUpRight size={19} aria-hidden="true" /></Link></div>
    <ul className="pet-profile__related-grid">{others.map(pet => <li key={pet.documentId}><Link href={`/pets/${pet.slug || pet.documentId}`} className="pet-profile__related-link"><div className="pet-profile__related-photo">{pet.photos?.[0] ? <ProfilePhoto src={petsService.resolveMediaUrl(pet.photos[0].url)} fallbackSrc={petsService.resolveMediaUrl(pet.photos[0].formats?.large?.url || pet.photos[0].url)} alt={pet.name} sizes="(max-width: 599px) calc(100vw - 40px), (max-width: 900px) 45vw, 420px" /> : <span>Фото скоро появится</span>}</div><div className="pet-profile__related-caption"><div><h3>{pet.name}</h3><p>{pet.type === 'dog' ? 'Собака' : 'Кошка'} · {profileAge(pet.birthDate)}</p></div><ArrowUpRight size={26} aria-hidden="true" /></div></Link></li>)}</ul>
  </div></section>;
}
export default async function PetDetailPage({ params }: PageProps) {
  // Keep the route request-rendered for reliable loading/retry states; CMS reads retain their 60s cache.
  await connection();
  const { id: identifier } = await params;
  let pet: Awaited<ReturnType<typeof getPet>>;
  try { pet = await getPet(identifier); }
  catch {
    // An upstream outage is an expected state, distinct from a missing animal.
    return <div className="pet-profile"><InnerHeader /><main id="main-content" className="pet-profile__container pet-profile__section pet-profile__unavailable"><h1>Не удалось загрузить страницу</h1><p>Попробуйте ещё раз или вернитесь к каталогу.</p><ProfileRetry /><Link href="/pets" className="pet-profile__text-link">Все питомцы</Link></main></div>;
  }
  if (!pet) notFound();
  if (pet.slug && identifier !== pet.slug) permanentRedirect(`/pets/${pet.slug}`);
  const home = pet.petStatus === 'home';
  const gender = { male: 'Мальчик', female: 'Девочка', mixed: 'Мальчики и девочки', unknown: 'Пол уточняется' }[pet.sex] || 'Пол уточняется';
  const GenderIcon = pet.sex === 'female' ? Venus : pet.sex === 'male' ? Mars : Info;
  const breed = (pet.type === 'dog' ? pet.dogBreed : pet.catBreed)?.name;
  const ratings = profileRatings(pet);
  const images = (pet.photos || []).map(photo => ({ src: petsService.resolveMediaUrl(photo.url), thumbnail: petsService.resolveMediaUrl(photo.formats?.thumbnail?.url || photo.formats?.small?.url || photo.url), preview: petsService.resolveMediaUrl(photo.formats?.large?.url || photo.url) }));
  const number = (value: number) => value.toLocaleString('ru-RU');
  const facts = [
    ...(pet.weight && pet.weight > 0 ? [{ icon: Weight, label: 'Вес', value: `${number(pet.weight)} кг` }] : []),
    ...(pet.height && pet.height > 0 ? [{ icon: Ruler, label: 'Рост в холке', value: `${number(pet.height)} см` }] : []),
    ...(breed ? [{ icon: PawPrint, label: 'Порода', value: breed }] : []),
    ...(typeof pet.sterilized === 'boolean' ? [{ icon: ShieldCheck, label: 'Стерилизация', value: pet.sterilized ? 'Да' : 'Нет' }] : []),
  ];
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', name: pet.name, description: profileDescription(pet), url: siteUrl(`/pets/${pet.slug || pet.documentId}`), ...(images[0] ? { primaryImageOfPage: { '@type': 'ImageObject', url: images[0].src } } : {}) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Питомцы', item: siteUrl('/pets') }, { '@type': 'ListItem', position: 3, name: pet.name, item: siteUrl(`/pets/${pet.slug || pet.documentId}`) }] },
  ] };
  const story = pet.descr?.trim();
  const intro = pet.shortDescr?.trim();
  return <div className="pet-profile"><InnerHeader /><main id="main-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <section className="pet-profile__hero pet-profile__container" aria-labelledby="pet-name">
      <nav className="pet-profile__breadcrumb" aria-label="Хлебные крошки"><Link href="/pets"><ArrowLeft size={18} aria-hidden="true" />Все питомцы</Link><span aria-hidden="true">/</span><span aria-current="page">{pet.name}</span></nav>
      <div className="pet-profile__portrait"><ProfileGallery images={images} name={pet.name} /><p className="pet-profile__photo-note"><MapPin size={15} aria-hidden="true" />Приют «Светлый», Ярославль</p></div>
      <header className="pet-profile__intro">
        <div className="pet-profile__title-row"><span className={`pet-profile__status${home ? ' pet-profile__status--home' : ''}`}>{home ? <Home size={17} aria-hidden="true" /> : <PawPrint size={17} aria-hidden="true" />}{home ? 'Уже дома' : 'Ищет дом'}</span><ProfileFavorite id={pet.documentId} name={pet.name} /></div>
        <h1 id="pet-name"><span className="pet-profile__name-accent">{pet.name}</span></h1>
        <ul className="pet-profile__badges" aria-label="Коротко о питомце">
          <li className="pet-profile__badge pet-profile__badge--species"><PawPrint size={16} aria-hidden="true" />{pet.type === 'dog' ? 'Собака' : 'Кошка'}</li>
          <li className="pet-profile__badge" data-sex={pet.sex}><GenderIcon size={16} aria-hidden="true" />{gender}</li>
          <li className="pet-profile__badge pet-profile__badge--age"><CalendarDays size={16} aria-hidden="true" />{profileAge(pet.birthDate)}</li>
          {pet.size && <li className="pet-profile__badge"><Ruler size={16} aria-hidden="true" />{{small:'Небольшой размер',medium:'Средний размер',large:'Крупный размер'}[pet.size]}</li>}
        </ul>
      </header>
      <div className="pet-profile__summary">
        <p className="pet-profile__lead">{intro || (home ? 'В этой истории уже появилась семья.' : 'Присмотритесь. Возможно, это начало вашей дружбы.')}</p>
        <div className="pet-profile__actions"><a href={home ? '/pets' : '#meet-pet'} className="pet-profile__button pet-profile__button--primary">{home ? <PawPrint size={19} aria-hidden="true" /> : <Heart size={19} aria-hidden="true" />}{home ? 'Кто ещё ищет дом' : 'Давайте знакомиться'}{home ? <ArrowUpRight size={18} aria-hidden="true" /> : <ArrowDown size={18} aria-hidden="true" />}</a><a href="#help-pet" className="pet-profile__button pet-profile__button--support"><HeartHandshake size={19} aria-hidden="true" />Помочь питомцу<ArrowDown size={18} aria-hidden="true" /></a></div>
        {facts.length > 0 && <dl className="pet-profile__facts">{facts.map(({ icon: Icon, label, value }) => <div key={label}><dt><span className="pet-profile__fact-icon"><Icon size={21} aria-hidden="true" /></span>{label}</dt><dd>{value}</dd></div>)}</dl>}
        {ratings.length > 0 && <div className="pet-profile__temperament"><h2><Sparkles size={20} aria-hidden="true" />Характер и привычки</h2><dl className="pet-profile__ratings">{ratings.map(({ key, label, value }) => { const Icon = key === 'activity' ? Zap : key === 'friendliness' ? Heart : GraduationCap; return <div key={key} data-trait={key}><dt><Icon size={18} aria-hidden="true" />{label}<span aria-hidden="true">{value} / 5</span></dt><dd><span className="sr-only">{value} из 5</span><span className="pet-profile__rating-track" aria-hidden="true"><i style={{width:`${value * 20}%`}} /></span></dd></div>; })}</dl></div>}
        {pet.undergoingTreatment === true && <p className="pet-profile__care-note"><ScanHeart size={22} aria-hidden="true" /><span>Сейчас проходит лечение. О самочувствии и уходе расскажет куратор.</span></p>}
        {(story && story !== intro || pet.character || pet.specialSigns || pet.chronicDiseases) && <details className="pet-profile__details"><summary><BookOpenText size={18} aria-hidden="true" />Подробнее о питомце</summary><div className="pet-profile__prose">{story && story !== intro && <p>{story}</p>}{pet.character && <p><strong>Характер и привычки.</strong> {pet.character}</p>}{pet.specialSigns && <p><strong>Особые приметы.</strong> {pet.specialSigns}</p>}{pet.chronicDiseases && <p><strong>Здоровье и уход.</strong> {pet.chronicDiseases}</p>}</div></details>}
      </div>
    </section>
    <ProfileSupport id={pet.documentId} name={pet.name} home={home} photo={images[0]?.thumbnail} />
    {!home && <section id="meet-pet" className="pet-profile__meeting pet-profile__section" aria-labelledby="meeting-heading"><div className="pet-profile__container pet-profile__meeting-grid">
      <div className="pet-profile__meeting-top"><Image src="/pets/decor-letter.webp" width={320} height={320} alt="" className="pet-profile__letter" /><div><h2 id="meeting-heading">Давайте <em>познакомимся</em></h2><p>Напишите нам, что вам приглянулся этот питомец. Расскажем о нём и договоримся о встрече в приюте.</p><a href={contactUrl} target="_blank" rel="noopener noreferrer" className="pet-profile__button pet-profile__button--white" aria-label="Написать в приют во ВКонтакте, откроется в новой вкладке"><MessageCircle size={20} aria-hidden="true" />Написать в приют <ArrowUpRight size={18} aria-hidden="true" /></a></div></div>
      <ol className="pet-profile__steps"><li><MessageCircle size={24} aria-hidden="true" /><div><h3>Спросите о важном</h3><p>О характере, здоровье и жизни рядом с вами.</p></div></li><li><MapPin size={24} aria-hidden="true" /><div><h3>Приезжайте познакомиться</h3><p>Время и адрес подскажем в переписке.</p></div></li><li><Home size={24} aria-hidden="true" /><div><h3>Обсудим переезд</h3><p>Поговорим об условиях дома и подготовке к новой жизни.</p></div></li></ol>
    </div></section>}
    <Suspense fallback={null}><RelatedPets id={pet.documentId} /></Suspense>
  </main></div>;
}

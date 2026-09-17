import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { InnerHeader } from '@/components/layout/inner-header';
import { PetsHero } from '@/components/pets/pets-hero';
import { PetsControls } from '@/components/pets/pets-controls';
import { PetsGrid } from '@/components/pets/pets-grid';
import { PetsControlsSkeleton } from '@/components/pets/pets-skeleton';
import { PetsPagination } from '@/components/pets/pets-pagination';
import { PetsQuizLauncher } from '@/components/pets/pets-quiz-launcher';
import { CatalogUnavailable } from '@/components/pets/catalog-unavailable';
import { petsService } from '@/lib/api/services/pets';
import { normalizePetData } from '@/lib/helpers/pets/normalize-pet-data';
import { catalogCanonical, hasCatalogFilters, parseCatalogQuery, PETS_PER_PAGE, type CatalogSearch } from '@/lib/pets/catalog-query';
import { siteUrl } from '@/lib/seo/site';
import '@/components/pets/pets.css';

interface PageProps { searchParams: Promise<CatalogSearch> }
const description = 'Собаки и кошки приюта «Светлый» в Ярославле: фотографии, возраст и истории питомцев. Найдите того, с кем хотите познакомиться.';

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const { page, options } = parseCatalogQuery(params);
  const title = `${options.status === 'home' ? 'Питомцы, которые нашли дом' : 'Собаки и кошки ищут дом в Ярославле'}${page > 1 ? ` · Страница ${page}` : ''}`;
  const canonical = catalogCanonical(params);
  return { title, description, alternates: { canonical }, robots: hasCatalogFilters(params) ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: canonical, type: 'website', locale: 'ru_RU', images: ['/og-image.jpg'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] } };
}

export default async function PetsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { page, options, favorites } = parseCatalogQuery(params);
  // Only the requested page crosses the boundary. Quiz data loads on opening.
  const response = await petsService.getPetsCollection(options).catch(() => null);
  if (!response) return <CatalogUnavailable />;
  const pets = response.data.map(normalizePetData);
  const total = response.meta?.pagination?.total ?? pets.length;
  const totalPages = Math.ceil(total / PETS_PER_PAGE);
  if (page > Math.max(1, totalPages)) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => { if (typeof value === 'string') query.set(key, value); });
    query.set('page', String(Math.max(1, totalPages)));
    redirect(`/pets?${query}`);
  }
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Питомцы приюта «Светлый»', url: siteUrl(catalogCanonical(params)),
    mainEntity: { '@type': 'ItemList', numberOfItems: total, itemListElement: pets.map((pet, index) => ({ '@type': 'ListItem', position: (page - 1) * PETS_PER_PAGE + index + 1, name: pet.name, url: siteUrl(`/pets/${pet.slug || pet.id}`) })) },
  };
  return (
    <div className="pets-page">
      <InnerHeader />
      <main id="main-content" tabIndex={-1}>
        <PetsHero />
        <section className="pets-catalog pets-wrap" id="pets-catalog" aria-label="Каталог питомцев">
          <p className="sr-only" role="status" aria-live="polite">{total === 0 ? 'По этим фильтрам питомцев нет' : `Найдено питомцев: ${total}. Страница ${page} из ${totalPages}.`}</p>
          <Suspense fallback={<PetsControlsSkeleton />}><PetsControls /></Suspense>
          <PetsGrid pets={pets} favorites={favorites} />
          <Suspense fallback={null}><PetsPagination currentPage={page} totalPages={totalPages} /></Suspense>
        </section>
        <section className="pets-help" aria-labelledby="pets-help-title">
          <div className="pets-wrap pets-help__inner">
            <figure className="pets-help__photo"><Image src="/about/real/dog-hand.jpg" alt="Собака положила лапу на руку человека" width={1400} height={1867} sizes="(max-width: 599px) 240px, (max-width: 899px) 260px, 340px" /></figure>
            <div className="pets-help__content"><h2 id="pets-help-title">Не знаете,<br /> с кого <em>начать?</em></h2><p>Ответьте на четыре вопроса. Мы предложим питомцев для знакомства, а куратор расскажет, какой у них характер и что нужно для жизни дома.</p><PetsQuizLauncher /></div>
          </div>
        </section>
        <section className="pets-meeting" aria-labelledby="pets-meeting-title">
          <div className="pets-meeting__inner pets-wrap">
          <Image className="pets-meeting__art" src="/pets/decor-letter.webp" alt="" width={640} height={640} sizes="(max-width: 599px) 132px, 160px" />
          <h2 id="pets-meeting-title">Сначала <em>познакомимся</em></h2>
          <p>Приглянулся кто-то из питомцев? Напишите нам: расскажем о нём подробнее, ответим на вопросы и договоримся о встрече.</p>
          <Link className="pets-button pets-button--light pets-meeting__button" href="https://vk.com/im?sel=-228082117" target="_blank" rel="noopener noreferrer"><MessageCircle size={20} aria-hidden="true" />Написать в приют <ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (в новой вкладке)</span></Link>
          </div>
        </section>
      </main>
      {!favorites && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />}
    </div>
  );
}

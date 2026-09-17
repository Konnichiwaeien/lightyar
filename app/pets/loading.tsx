import { InnerHeader } from '@/components/layout/inner-header';
import { PetsHero } from '@/components/pets/pets-hero';
import { PetsCatalogSkeleton } from '@/components/pets/pets-skeleton';
import '@/components/pets/pets.css';

export default function PetsLoading() {
  return <div className="pets-page" data-pets-loading>
    <InnerHeader />
    <main id="main-content" tabIndex={-1}>
      <PetsHero />
      <section className="pets-catalog pets-wrap" id="pets-catalog" aria-label="Каталог питомцев" aria-busy="true">
        <p className="sr-only" role="status">Загружаем питомцев…</p>
        <PetsCatalogSkeleton />
      </section>
    </main>
  </div>;
}

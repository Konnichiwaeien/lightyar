import { Suspense } from "react";
import { PetsControls } from "@/components/pets/pets-controls";
import { PetsPagination } from "@/components/pets/pets-pagination";
import { InnerHeader } from "@/components/layout/inner-header";
import { Metadata } from "next";
import { petsService } from "@/lib/api/services/pets";
import { siteMediaService } from "@/lib/api/services/site-media";
import { normalizePetData } from "@/lib/helpers/pets/normalize-pet-data";
import { PetsHero } from "@/components/pets/pets-hero";
import { PetsGrid } from "@/components/pets/pets-grid";
import { CatalogUnavailable } from "@/components/pets/catalog-unavailable";

export const metadata: Metadata = {
  title: "Наши питомцы",
  description: "Ищете верного друга? Посмотрите наш каталог собак и кошек из приюта «Светлый» в Ярославле. Все питомцы привиты, социализированы и очень ждут свою любящую семью. Подарите хвостику дом!",
  keywords: ["приют для животных", "взять собаку из приюта", "взять кошку", "ярославль", "светлый", "бездомные животные", "найти друга"],
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PetsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const status = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "shelter";
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "name_asc";
  const parsedPage = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;

  // New filters
  const type = typeof resolvedSearchParams.type === "string" && (resolvedSearchParams.type === "dog" || resolvedSearchParams.type === "cat") ? resolvedSearchParams.type : undefined;
  const sex = typeof resolvedSearchParams.sex === "string" && (resolvedSearchParams.sex === "male" || resolvedSearchParams.sex === "female") ? resolvedSearchParams.sex : undefined;
  const size = typeof resolvedSearchParams.size === "string" && (resolvedSearchParams.size === "small" || resolvedSearchParams.size === "medium" || resolvedSearchParams.size === "large") ? resolvedSearchParams.size : undefined;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;

  const isFavorites = resolvedSearchParams.favorites === "true";
  const favoritesIdsStr = typeof resolvedSearchParams.ids === "string" ? resolvedSearchParams.ids : "";
  const favoriteIds = favoritesIdsStr ? favoritesIdsStr.split(",") : [];

  const itemsPerPage = 12;

  // Map UI sort values to Strapi sort parameters
  const sortMap: Record<string, string> = {
    name_asc: 'name:asc',
    name_desc: 'name:desc',
    age_asc: 'birthDate:desc',   // younger = later birthDate
    age_desc: 'birthDate:asc',   // older = earlier birthDate
  };
  const strapiSort = sortMap[sort] || 'name:asc';

  // The catalog is paginated in Strapi. The quiz uses a separate lightweight
  // projection instead of serializing every populated pet into the page.
  const [petsResponse, allShelterPetsRaw, siteMedia] = await Promise.all([
    petsService.getPetsCollection({
      status: status === "home" ? "home" : "shelter",
      type,
      sex,
      size,
      search,
      sort: strapiSort,
      ids: isFavorites ? favoriteIds : undefined,
      limit: itemsPerPage,
      start: (page - 1) * itemsPerPage,
    }),
    petsService.getQuizPets(),
    siteMediaService.getSiteMedia(),
  ]);

  if (!petsResponse) {
    return <CatalogUnavailable />;
  }

  const paginated = (petsResponse.data || []).map(normalizePetData);
  const totalItems = petsResponse.meta?.pagination?.total || paginated.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));

  const allShelterPetsMapped = (allShelterPetsRaw || []).map(normalizePetData);

  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white">
      <InnerHeader />
      <main className="text-[#1c1c1c] pt-12 px-4 sm:px-6 md:px-12 pb-24">
        <div className="max-w-[1400px] mx-auto relative">
          
          <PetsHero allPets={allShelterPetsMapped} videoUrl={siteMedia.heroVideo} posterUrl={siteMedia.heroPoster} />

          <Suspense fallback={null}>
            <PetsControls />
          </Suspense>

          <PetsGrid pets={paginated} />

          <Suspense fallback={null}>
            <PetsPagination currentPage={safePage} totalPages={totalPages} />
          </Suspense>

        </div>
      </main>
    </div>
  );
}

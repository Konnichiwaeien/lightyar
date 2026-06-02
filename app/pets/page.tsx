import { Suspense } from "react";
import { PetsControls } from "@/components/pets/pets-controls";
import { PetsPagination } from "@/components/pets/pets-pagination";
import { InnerHeader } from "@/components/layout/inner-header";
import { Metadata } from "next";
import { petsService } from "@/lib/api/services/pets";
import { normalizePetData } from "@/lib/helpers/pets/normalize-pet-data";
import { PetsHero } from "@/components/pets/pets-hero";
import { PetsGrid } from "@/components/pets/pets-grid";
import { CatalogUnavailable } from "@/components/pets/catalog-unavailable";

export const metadata: Metadata = {
  title: "Наши питомцы | Приют для животных «Светлый» Ярославль",
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
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;

  // New filters
  const type = typeof resolvedSearchParams.type === "string" && (resolvedSearchParams.type === "dog" || resolvedSearchParams.type === "cat") ? resolvedSearchParams.type : undefined;
  const sex = typeof resolvedSearchParams.sex === "string" && (resolvedSearchParams.sex === "male" || resolvedSearchParams.sex === "female") ? resolvedSearchParams.sex : undefined;
  const size = typeof resolvedSearchParams.size === "string" && (resolvedSearchParams.size === "small" || resolvedSearchParams.size === "medium" || resolvedSearchParams.size === "large") ? resolvedSearchParams.size : undefined;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;

  const isFavorites = resolvedSearchParams.favorites === "true";
  const favoritesIdsStr = typeof resolvedSearchParams.ids === "string" ? resolvedSearchParams.ids : "";
  const favoriteIds = favoritesIdsStr ? favoritesIdsStr.split(",") : [];

  const itemsPerPage = 12;

  // Fetch real pets from Strapi API directly filtered by status and new controls
  const realPetsRaw = await petsService.getPets({
    status: status === "home" ? "home" : "shelter",
    type,
    sex,
    size,
    search,
    limit: isFavorites ? 200 : undefined
  });
  
  if (realPetsRaw === null) {
    return <CatalogUnavailable />;
  }

  // Normalize API data to clean flat structures
  const petsMapped = realPetsRaw.map(normalizePetData);

  // Filter by favorites if active
  const petsFiltered = isFavorites
    ? petsMapped.filter(pet => favoriteIds.includes(pet.id))
    : petsMapped;

  // Sort
  const sorted = [...petsFiltered].sort((a, b) => {
    if (sort === "name_asc") return a.name.localeCompare(b.name, "ru");
    if (sort === "name_desc") return b.name.localeCompare(a.name, "ru");
    if (sort === "age_asc") return a.age - b.age;
    if (sort === "age_desc") return b.age - a.age;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const paginated = sorted.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  // Fetch all active shelter pets for matchmaking quiz (limit 150 items)
  const allShelterPetsRaw = await petsService.getPets({
    status: "shelter",
    limit: 150
  }) || [];
  const allShelterPetsMapped = allShelterPetsRaw.map(normalizePetData);

  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white">
      <InnerHeader />
      <main className="text-[#1c1c1c] pt-12 px-4 sm:px-6 md:px-12 pb-24">
        <div className="max-w-[1400px] mx-auto relative">
          
          <PetsHero allPets={allShelterPetsMapped} />

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

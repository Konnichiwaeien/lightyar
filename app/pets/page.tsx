import { Suspense } from "react";
import { PetsControls } from "@/components/pets/pets-controls";
import { PetsPagination } from "@/components/pets/pets-pagination";
import { InnerHeader } from "@/components/layout/inner-header";
import { Heart, Home, PawPrint } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Наши питомцы | Светлый",
};

const PET_NAMES = ["Шарик", "Бобик", "Мухтар", "Рекс", "Лайма", "Джесси", "Барон", "Альфа", "Тоша", "Нора", "Чарли", "Соня", "Граф", "Бася", "Зефир", "Мася", "Дик", "Моня", "Ника", "Кекс", "Буся", "Арчи", "Персик", "Симба"];

const PET_IMAGES = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1537151608828-ea2b11777ee9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1601630138404-32b0ed355153?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=800",
];

const MOCK_PETS = Array.from({ length: 24 }).map((_, i) => {
  const isHome = i % 5 === 0;
  const age = 0.5 + (i % 12) * 0.8;
  const species = i % 3 === 0 ? "Кошка" : "Собака";
  const gender = i % 2 === 0 ? "Мальчик" : "Девочка";

  return {
    id: `pet-${i + 1}`,
    name: PET_NAMES[i % PET_NAMES.length],
    species,
    breed: species === "Собака"
      ? ["Метис", "Дворняга", "Лабрадор-метис", "Овчарка-метис", "Спаниель-метис"][i % 5]
      : ["Метис", "Беспородная", "Сиамская-метис", "Британский метис"][i % 4],
    age: Math.round(age * 10) / 10,
    gender,
    image: PET_IMAGES[i % PET_IMAGES.length],
    status: isHome ? "home" as const : "shelter" as const,
    description: isHome
      ? "Нашёл свою семью и счастлив в новом доме! Спасибо всем, кто помог."
      : "Ищет любящую семью. Ласковый, игривый, привит и стерилизован. Готов к переезду!",
    tag: isHome ? "Дома" : (i % 4 === 1 ? "Новенький" : i % 4 === 2 ? "Срочно" : "Ищет дом"),
  };
});

function formatAge(age: number): string {
  if (age < 1) return `${Math.round(age * 12)} мес.`;
  const years = Math.floor(age);
  const suffix = years === 1 ? "год" : years < 5 ? "года" : "лет";
  return `${years} ${suffix}`;
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function PetsPage({ searchParams }: PageProps) {
  const status = typeof searchParams.status === "string" ? searchParams.status : "shelter";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "name_asc";
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = 12;

  // 1. Filter
  let filtered = MOCK_PETS.filter((p) => p.status === status);

  // 2. Sort
  filtered = filtered.sort((a, b) => {
    if (sort === "name_asc") return a.name.localeCompare(b.name, "ru");
    if (sort === "name_desc") return b.name.localeCompare(a.name, "ru");
    if (sort === "age_asc") return a.age - b.age;
    if (sort === "age_desc") return b.age - a.age;
    return 0;
  });

  // 3. Paginate
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white">
      <InnerHeader />
      <main className="text-[#1c1c1c] pt-12 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto relative">

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#1c1c1c] leading-none mb-6">
              Наши <span className="italic text-amber-500">питомцы</span>
            </h1>
            <p className="text-[#1c1c1c]/60 max-w-xl text-lg md:text-xl font-light">
              Каждый из них заслуживает любящий дом. Познакомьтесь с нашими подопечными — возможно, один из них станет вашим лучшим другом.
            </p>
          </div>

          {/* Controls */}
          <Suspense fallback={null}><PetsControls /></Suspense>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {paginated.length > 0 ? (
              paginated.map((pet, index) => {
                const isLarge = index === 0 || index === 5;
                const colSpanClass = isLarge ? "sm:col-span-2 lg:col-span-2" : "col-span-1";

                return (
                  <Link
                    href={`/pets/${pet.id}`}
                    key={pet.id}
                    className={`group relative bg-white border border-[#1c1c1c]/5 rounded-[2rem] overflow-hidden flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 ${colSpanClass} pointer-events-auto h-full min-h-[420px] cursor-pointer`}
                  >
                    <div className={`w-full ${isLarge ? 'h-72' : 'h-56'} shrink-0 overflow-hidden relative`}>
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className={`w-full h-full object-cover transition-transform duration-1000 ${pet.status === 'home' ? 'grayscale-[30%] opacity-80' : 'group-hover:scale-105'}`}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-white via-white/20 to-transparent opacity-80" />

                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]">
                        {pet.tag}
                      </div>

                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/60">
                        {pet.species}
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col flex-1 bg-white relative z-10 w-full h-full justify-between">
                      <div className="mb-6">
                        <h3 className={`font-serif leading-tight mb-2 text-[#1c1c1c] ${pet.status === 'home' ? 'text-black/60' : 'group-hover:text-amber-500'} transition-colors duration-300 ${isLarge ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                          {pet.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                            {formatAge(pet.age)}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 bg-[#1c1c1c]/5 px-3 py-1 rounded-full">
                            {pet.gender}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 bg-[#1c1c1c]/5 px-3 py-1 rounded-full">
                            {pet.breed}
                          </span>
                        </div>
                        <p className={`text-[#1c1c1c]/50 text-sm font-light ${isLarge ? 'line-clamp-3' : 'line-clamp-2'}`}>
                          {pet.description}
                        </p>
                      </div>

                      {/* Bottom Action */}
                      <div className="mt-auto">
                        {pet.status === 'shelter' ? (
                          <div className="w-full bg-[#1c1c1c] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-amber-500 transition-colors flex items-center justify-center gap-2">
                            <PawPrint size={16} /> Познакомиться
                          </div>
                        ) : (
                          <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2">
                            <Home size={16} /> Дома
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center">
                <span className="inline-block p-6 bg-white rounded-full mx-auto mb-6">
                  <PawPrint size={48} className="text-[#1c1c1c]/10" />
                </span>
                <h3 className="text-2xl font-serif text-[#1c1c1c] mb-2">Питомцев не найдено</h3>
                <p className="text-[#1c1c1c]/50">Попробуйте изменить параметры фильтрации.</p>
              </div>
            )}
          </div>

          <Suspense fallback={null}><PetsPagination currentPage={safePage} totalPages={totalPages} /></Suspense>

        </div>
      </main>
    </div>
  );
}

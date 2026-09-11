import { InnerHeader } from "@/components/layout/inner-header";
import { CampaignGallery } from "@/components/campaigns/campaign-gallery";
import { Heart, PawPrint, Calendar, Ruler, Weight, Syringe, Scissors, Home, Info, Dog, Cat } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { petsService } from "@/lib/api/services/pets";
import { notFound } from "next/navigation";
import { BreedInfoDetailButton } from "@/components/pets/breed-info-detail-button";
import { formatAge } from "@/lib/helpers/pets/format-age";
import { calculateAgeInYears } from "@/lib/helpers/pets/calculate-age-in-years";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const ids = await petsService.getAllPetIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const pet = await petsService.getPetById(resolvedParams.id);
  
  if (!pet) {
    return {
      title: "Питомец не найден",
    };
  }

  return {
    title: `${pet.name} | Наши питомцы`,
    description: pet.shortDescr || pet.descr || `Познакомьтесь с подопечным ${pet.name} в приюте Светлый.`,
  };
}

const TRAIT_ICONS: Record<string, React.ReactNode> = {
  calendar: <Calendar size={18} />,
  ruler: <Ruler size={18} />,
  weight: <Weight size={18} />,
  syringe: <Syringe size={18} />,
  scissors: <Scissors size={18} />,
  paw: <PawPrint size={18} />,
};

export default async function PetDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const pet = await petsService.getPetById(resolvedParams.id);

  if (!pet) {
    notFound();
  }

  // Determine pet status
  const petStatus = pet.petStatus || "shelter";
  const speciesText = pet.type === "dog" ? "Собака" : "Кошка";
  const genderText = pet.sex === "male" ? "Мальчик" : "Девочка";
  const breedText = pet.type === "dog" ? (pet.dogBreed?.name || "Метис") : (pet.catBreed?.name || "Метис");
  
  const ageText = formatAge(calculateAgeInYears(pet.birthDate));
  const heightText = pet.height ? `${pet.height} см в холке` : "Не указан";
  const weightText = pet.weight ? `${pet.weight} кг` : "Не указан";
  const sterilizedText = pet.sterilized ? "Да" : "Нет";
  const vaccinatedText = pet.undergoingTreatment ? "Под наблюдением" : "Привит(а), готов(а) к переезду";

  const traits = [
    { icon: "calendar", label: "Возраст", value: ageText },
    { icon: "ruler", label: "Рост", value: heightText },
    { icon: "weight", label: "Вес", value: weightText },
    { icon: "syringe", label: "Вакцинация", value: vaccinatedText },
    { icon: "scissors", label: "Стерилизация", value: sterilizedText },
    { icon: "paw", label: "Порода", value: breedText },
  ];

  // Resolve images
  let imagesList: string[] = [];
  if (pet.photos && pet.photos.length > 0) {
    imagesList = pet.photos.map(p => petsService.resolveMediaUrl(p.url));
  }

  // Fetch other pets looking for a home for the bottom section
  const allPets = await petsService.getPets({ status: "shelter", limit: 10 }) || [];
  
  // Deterministic shuffle based on pet's documentId to ensure purity and stable recommendation lists
  const seed = pet.documentId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const otherPets = allPets
    .filter(p => p.documentId !== pet.documentId)
    .sort((a, b) => {
      const valA = a.documentId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const valB = b.documentId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return ((valA ^ seed) % 10) - ((valB ^ seed) % 10);
    })
    .slice(0, 3)
    .map(p => {
      let imgUrl = "";
      if (p.photos && p.photos.length > 0) {
        imgUrl = petsService.resolveMediaUrl(p.photos[0].url);
      }
      return {
        id: p.documentId,
        name: p.name,
        species: p.type === "dog" ? "Собака" : "Кошка",
        age: formatAge(calculateAgeInYears(p.birthDate)),
        img: imgUrl,
      };
    });

  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white font-sans text-[#1c1c1c]">
      <InnerHeader />
      <main className="max-w-[1400px] mx-auto pt-8 px-4 sm:px-6 md:px-12 pb-20">

        {/* ═══ Hero: Gallery + Info Card ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start relative mb-16">

          {/* Left: Gallery (Sticky) */}
          <div className="lg:col-span-7 lg:sticky lg:top-8">
            <CampaignGallery images={imagesList} petName={pet.name} species={speciesText} />
          </div>

          {/* Right: Quick Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Name Card */}
            <header className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full">{speciesText}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 bg-[#1c1c1c]/5 px-3 py-1.5 rounded-full">{genderText}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 bg-[#1c1c1c]/5 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  {petStatus === "shelter" ? (
                    <>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      В приюте
                    </>
                  ) : (
                    "Дома"
                  )}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-4 text-[#1c1c1c]">
                {pet.name}
              </h1>
              <p className="text-[#1c1c1c]/50 text-base font-light mb-8 leading-relaxed">
                {pet.shortDescr || `Знакомьтесь, это очаровательный хвостик по имени ${pet.name}. Очень преданный, послушный и ищет любящий дом.`}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                {petStatus === "shelter" ? (
                  <>
                    <button className="w-full bg-[#2e2620] text-white hover:bg-amber-500 py-5 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-colors duration-300 focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden">
                      <Heart size={18} /> Хочу забрать домой
                    </button>
                    <button className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 border border-amber-200 transition-colors duration-300 focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden">
                      <PawPrint size={18} /> Стать куратором
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 py-5 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                    <Home size={18} /> Уже дома
                  </div>
                )}

                {/* Breed Info Button */}
                <BreedInfoDetailButton breedName={breedText} />
              </div>
            </header>

            {/* Traits Card */}
            <section 
              aria-label="Основные характеристики питомца"
              className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5"
            >
              <h2 className="font-serif text-2xl mb-6 text-[#1c1c1c]">Характеристики</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {traits.map((trait, idx) => (
                  <div key={idx} className="bg-[#f9f8f6] rounded-[1rem] p-4 flex items-start gap-3 hover:bg-[#e8e4dc]/50 transition-colors">
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-amber-500 shadow-sm shrink-0 mt-0.5" aria-hidden="true">
                      {TRAIT_ICONS[trait.icon] || <Info size={18} />}
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 mb-1">{trait.label}</dt>
                      <dd className="text-sm font-medium text-[#1c1c1c]">{trait.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            {/* Temperament / Scales Card */}
            {(pet.activity !== undefined || pet.friendliness !== undefined || pet.trainability !== undefined) && (
              <section 
                aria-label="Темперамент и характер питомца"
                className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5"
              >
                <h2 className="font-serif text-2xl mb-6 text-[#1c1c1c]">Темперамент и характер</h2>
                <div className="flex flex-col gap-5">
                  {/* Activity */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#1c1c1c]/60 mb-2">
                      <span>Активность</span>
                      <span className="text-amber-500">{(pet.activity ?? 5)} / 5</span>
                    </div>
                    <div 
                      role="progressbar"
                      aria-valuenow={pet.activity ?? 5}
                      aria-valuemin={0}
                      aria-valuemax={5}
                      aria-label="Уровень активности питомца"
                      className="w-full h-2.5 bg-[#e8e4dc] rounded-full overflow-hidden"
                    >
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                        style={{ width: `${((pet.activity ?? 5) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  {/* Friendliness */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#1c1c1c]/60 mb-2">
                      <span>Дружелюбие</span>
                      <span className="text-amber-500">{(pet.friendliness ?? 5)} / 5</span>
                    </div>
                    <div 
                      role="progressbar"
                      aria-valuenow={pet.friendliness ?? 5}
                      aria-valuemin={0}
                      aria-valuemax={5}
                      aria-label="Уровень дружелюбия питомца"
                      className="w-full h-2.5 bg-[#e8e4dc] rounded-full overflow-hidden"
                    >
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                        style={{ width: `${((pet.friendliness ?? 5) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  {/* Trainability */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#1c1c1c]/60 mb-2">
                      <span>Обучаемость</span>
                      <span className="text-amber-500">{(pet.trainability ?? 5)} / 5</span>
                    </div>
                    <div 
                      role="progressbar"
                      aria-valuenow={pet.trainability ?? 5}
                      aria-valuemin={0}
                      aria-valuemax={5}
                      aria-label="Уровень обучаемости питомца"
                      className="w-full h-2.5 bg-[#e8e4dc] rounded-full overflow-hidden"
                    >
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                        style={{ width: `${((pet.trainability ?? 5) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Important Note */}
            <div className="bg-amber-50 rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 flex gap-4 items-start border border-amber-500/10 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div className="bg-amber-500 text-white p-3 rounded-[1rem] shrink-0 shadow-[0_4px_10px_rgba(245,158,11,0.2)]">
                <Info size={20} strokeWidth={2} />
              </div>
              <p className="text-xs font-medium text-[#1c1c1c]/70 leading-relaxed pt-1">
                Перед тем как забрать питомца, мы проводим собеседование и проверку условий содержания. Это помогает найти лучшую семью для каждого подопечного.
              </p>
            </div>

          </div>
        </div>

        {/* ═══ About Section ═══ */}
        <section 
          aria-labelledby="about-section-title"
          className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-8 md:p-12 lg:p-16 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5 w-full mb-12"
        >
          <h2 id="about-section-title" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-4 text-[#1c1c1c]">
            Кто такой <span className="italic text-amber-500">{pet.name}</span>?
          </h2>
          <h3 className="text-[#1c1c1c]/40 text-sm font-bold uppercase tracking-widest mb-10">История подопечного</h3>
          <div className="prose prose-lg max-w-none text-[#1c1c1c]/70 font-light leading-relaxed prose-p:mb-6">
            {pet.descr ? (
              pet.descr.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph.trim()}</p>
              ))
            ) : (
              <>
                <p>
                  {pet.name} — замечательный представитель приюта «Светлый». Был спасен волонтерами и привезен в приют, где прошел полный курс адаптации, реабилитации и социализации.
                </p>
                <p>
                  Этот хвостик отличается покладистым нравом, очень любит ласку и прогулки на свежем воздухе. Он полностью готов переехать в любящую семью, чтобы радовать хозяев преданным взглядом каждый день.
                </p>
              </>
            )}
            {pet.character && (
              <>
                <h3 className="font-serif text-xl font-bold mt-8 mb-4 text-[#1c1c1c]">Особенности характера</h3>
                <p>{pet.character}</p>
              </>
            )}
            {pet.specialSigns && (
              <>
                <h3 className="font-serif text-xl font-bold mt-8 mb-4 text-[#1c1c1c]">Особые приметы</h3>
                <p>{pet.specialSigns}</p>
              </>
            )}
          </div>
        </section>

        {/* ═══ Other Pets Promo ═══ */}
        {otherPets.length > 0 && (
          <section className="mt-8 mb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[#1c1c1c] mb-4">
                Другие <span className="italic text-amber-500">подопечные</span>
              </h2>
              <p className="text-[#1c1c1c]/50 text-base sm:text-lg font-light max-w-xl mx-auto">
                Познакомьтесь с другими хвостиками, которые тоже мечтают о доме.
              </p>
            </div>

            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPets.map((item, idx) => (
                <li key={idx} className="list-none">
                  <Link
                    href={`/pets/${item.id}`}
                    className="group bg-white rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden border border-[#1c1c1c]/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 flex flex-col focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden"
                  >
                    <div className="h-72 sm:h-56 w-full overflow-hidden rounded-[2rem] relative shrink-0">
                      {item.img ? (
                        <Image src={item.img} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 bg-[#f4ece1] flex flex-col items-center justify-center text-amber-600/70 p-6 select-none">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xs mb-2 text-amber-500/80">
                            {item.species === "Собака" ? <Dog size={20} strokeWidth={1.5} /> : <Cat size={20} strokeWidth={1.5} />}
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 text-center">Фото скоро появится</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]">
                        {item.species}
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <h3 className="font-serif text-2xl mb-2 text-[#1c1c1c] group-hover:text-amber-500 transition-colors duration-300 leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex gap-2 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1 rounded-full">{item.age}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 bg-[#1c1c1c]/5 px-3 py-1 rounded-full">Ищет дом</span>
                      </div>
                      <div className="w-full bg-[#2e2620] text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group-hover:bg-amber-500 transition-colors">
                        <PawPrint size={14} /> Познакомиться
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="text-center mt-10">
              <Link
                href="/pets"
                className="inline-flex items-center gap-3 bg-[#2e2620] text-white px-10 py-5 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors duration-300 focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden focus-visible:ring-offset-2"
              >
                Все питомцы
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  PawPrint, 
  Dog, 
  Cat, 
  Smile, 
  Heart, 
  Baby, 
  Ruler, 
  Sparkle,
  Bookmark
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MappedPet } from "@/lib/helpers/pets/normalize-pet-data";

interface PetsMatchQuizProps {
  pets: MappedPet[];
  onClose?: () => void;
}

type Step = 1 | 2 | 3 | 4 | "results";

export function PetsMatchQuiz({ pets, onClose }: PetsMatchQuizProps) {
  const [step, setStep] = useState<Step>(1);
  const [species, setSpecies] = useState<"dog" | "cat" | "any">("any");
  const [size, setSize] = useState<"small" | "medium" | "large" | "any">("any");
  const [activity, setActivity] = useState<"chill" | "moderate" | "active">("moderate");
  const [hasKidsOrPets, setHasKidsOrPets] = useState<"yes" | "no">("no");
  
  // Scored results
  const [results, setResults] = useState<{ pet: MappedPet; matchPercentage: number }[]>([]);

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) {
      calculateMatches();
      setStep("results");
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
  };

  const calculateMatches = () => {
    const scored = pets.map((pet) => {
      let score = 100;

      // 1. Species check (Hard filter)
      if (species === "dog" && pet.species !== "Собака") return null;
      if (species === "cat" && pet.species !== "Кошка") return null;

      // 2. Size check
      if (size !== "any") {
        if (pet.size !== size) {
          score -= 25;
        }
      }

      // 3. Activity match
      if (activity === "chill") {
        // Ideal is low activity (1-2). High activity (4-5) is penalized
        if (pet.activity > 3) {
          score -= (pet.activity - 3) * 20;
        }
      } else if (activity === "moderate") {
        // Ideal is 2-4. Extreme low (1) or high (5) is slightly penalized
        if (pet.activity === 1 || pet.activity === 5) {
          score -= 15;
        }
      } else if (activity === "active") {
        // Ideal is high activity (4-5). Low activity (1-2) is penalized
        if (pet.activity < 4) {
          score -= (4 - pet.activity) * 20;
        }
      }

      // 4. Socialization check
      if (hasKidsOrPets === "yes") {
        if (!pet.socialized) {
          score -= 25;
        }
        if (pet.friendliness < 3) {
          score -= (3 - pet.friendliness) * 15;
        }
      } else {
        // Boost score slightly if they don't have kids/pets and pet isn't socialized yet
        if (!pet.socialized) {
          score += 5;
        }
      }

      // Keep score within bounds
      const finalScore = Math.max(10, Math.min(100, score));

      return {
        pet,
        matchPercentage: finalScore
      };
    })
    .filter((item): item is { pet: MappedPet; matchPercentage: number } => item !== null)
    // Sort by highest matchPercentage
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Keep top-3 recommendations
    setResults(scored.slice(0, 3));
  };

  const resetQuiz = () => {
    setSpecies("any");
    setSize("any");
    setActivity("moderate");
    setHasKidsOrPets("no");
    setResults([]);
    setStep(1);
  };

  // Step transition anim configurations
  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  };

  return (
    <div className="w-full relative p-4 sm:p-6 md:p-10">
      
      {/* Premium background accents */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-200/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-rose-200/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header section with progress bar */}
      <div className="mb-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#1c1c1c] flex items-center gap-2.5">
            {step === "results" ? (
              <>
                <Sparkles size={24} className="text-amber-500 shrink-0" />
                <span>Ваши идеальные друзья</span>
              </>
            ) : (
              <>
                <PawPrint size={24} className="text-amber-500 shrink-0" />
                <span>Подберите идеального друга</span>
              </>
            )}
          </h2>
        </div>

        {step !== "results" && (
          <div 
            className="flex items-center gap-2"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={4}
            aria-label={`Шаг ${step} из 4`}
          >
            <span className="text-[10px] font-bold text-[#1c1c1c]/40 uppercase tracking-widest">Шаг {step} из 4</span>
            <div className="w-32 h-1.5 bg-black/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {step === "results" && (
          <button
            onClick={resetQuiz}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 hover:bg-amber-100/80 px-4 py-2 rounded-full transition-all cursor-pointer border border-amber-500/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden self-start md:self-auto"
          >
            <RotateCcw size={12} /> Пройти заново
          </button>
        )}
      </div>

      {/* Main step container */}
      <div className="relative min-h-[280px] z-10 flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step-1" {...slideVariants} className="flex flex-col gap-6">
              <p className="text-[#2e2620]/70 text-base sm:text-lg md:text-xl font-light leading-relaxed mb-6">
                Выберите, кого вы мечтаете приютить. Собаку для активных пробежек или кошку для уютных вечеров?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Dog Choice */}
                <button
                  type="button"
                  onClick={() => setSpecies("dog")}
                  aria-pressed={species === "dog"}
                  className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    species === "dog" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Dog size={32} className={`mb-3 ${species === "dog" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Собаку</span>
                </button>

                {/* Cat Choice */}
                <button
                  type="button"
                  onClick={() => setSpecies("cat")}
                  aria-pressed={species === "cat"}
                  className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    species === "cat" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Cat size={32} className={`mb-3 ${species === "cat" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Кошку</span>
                </button>

                {/* Any Choice */}
                <button
                  type="button"
                  onClick={() => setSpecies("any")}
                  aria-pressed={species === "any"}
                  className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    species === "any" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <PawPrint size={32} className={`mb-3 ${species === "any" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Не имеет значения</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" {...slideVariants} className="flex flex-col gap-6">
              <p className="text-[#1c1c1c]/70 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-6">
                Размер имеет значение в зависимости от площади вашего жилья. Какого размера питомец будет наиболее гармоничен у вас дома?
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                {/* Small Choice */}
                <button
                  type="button"
                  onClick={() => setSize("small")}
                  aria-pressed={size === "small"}
                  className={`flex flex-col items-center justify-center p-4.5 sm:p-5 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    size === "small" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Ruler size={24} className={`mb-3 ${size === "small" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Маленький</span>
                  <span className="text-[9px] text-[#1c1c1c]/40 mt-1 uppercase tracking-widest">до 10 кг</span>
                </button>

                {/* Medium Choice */}
                <button
                  type="button"
                  onClick={() => setSize("medium")}
                  aria-pressed={size === "medium"}
                  className={`flex flex-col items-center justify-center p-4.5 sm:p-5 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    size === "medium" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Ruler size={24} className={`mb-3 ${size === "medium" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Средний</span>
                  <span className="text-[9px] text-[#1c1c1c]/40 mt-1 uppercase tracking-widest">10 - 25 кг</span>
                </button>

                {/* Large Choice */}
                <button
                  type="button"
                  onClick={() => setSize("large")}
                  aria-pressed={size === "large"}
                  className={`flex flex-col items-center justify-center p-4.5 sm:p-5 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    size === "large" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Ruler size={24} className={`mb-3 ${size === "large" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Крупный</span>
                  <span className="text-[9px] text-[#1c1c1c]/40 mt-1 uppercase tracking-widest">более 25 кг</span>
                </button>

                {/* Any Choice */}
                <button
                  type="button"
                  onClick={() => setSize("any")}
                  aria-pressed={size === "any"}
                  className={`flex flex-col items-center justify-center p-4.5 sm:p-5 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    size === "any" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:text-[#1c1c1c] hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Smile size={24} className={`mb-3 ${size === "any" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Любой</span>
                  <span className="text-[9px] text-[#1c1c1c]/40 mt-1 uppercase tracking-widest">неважно</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step-3" {...slideVariants} className="flex flex-col gap-6">
              <p className="text-[#1c1c1c]/70 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-6">
                Как вы предпочитаете проводить свободное время? Мы подберем хвостика с соответствующим уровнем энергии.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Chill Choice */}
                <button
                  type="button"
                  onClick={() => setActivity("chill")}
                  aria-pressed={activity === "chill"}
                  className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    activity === "chill" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Heart size={32} className={`mb-3 ${activity === "chill" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Спокойный</span>
                  <span className="text-[9px] text-[#1c1c1c]/40 mt-1.5 uppercase tracking-widest">Уютный отдых дома</span>
                </button>

                {/* Moderate Choice */}
                <button
                  type="button"
                  onClick={() => setActivity("moderate")}
                  aria-pressed={activity === "moderate"}
                  className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    activity === "moderate" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Smile size={32} className={`mb-3 ${activity === "moderate" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Умеренный</span>
                  <span className="text-[9px] text-[#1c1c1c]/40 mt-1.5 uppercase tracking-widest">Неспешные прогулки</span>
                </button>

                {/* Active Choice */}
                <button
                  type="button"
                  onClick={() => setActivity("active")}
                  aria-pressed={activity === "active"}
                  className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    activity === "active" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Sparkle size={32} className={`mb-3 ${activity === "active" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Активный</span>
                  <span className="text-[9px] text-[#1c1c1c]/40 mt-1.5 uppercase tracking-widest">Спорт, походы, игры</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step-4" {...slideVariants} className="flex flex-col gap-6">
              <p className="text-[#1c1c1c]/70 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-6">
                Есть ли в вашем доме маленькие дети или другие домашние животные? Это поможет выбрать максимально дружелюбного и социализированного питомца.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Yes Choice */}
                <button
                  type="button"
                  onClick={() => setHasKidsOrPets("yes")}
                  aria-pressed={hasKidsOrPets === "yes"}
                  className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    hasKidsOrPets === "yes" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Baby size={32} className={`mb-3 ${hasKidsOrPets === "yes" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Да, есть</span>
                  <span className="text-[9px] text-[#1c1c1c]/40 mt-1.5 uppercase tracking-widest">дети / собаки / кошки</span>
                </button>

                {/* No Choice */}
                <button
                  type="button"
                  onClick={() => setHasKidsOrPets("no")}
                  aria-pressed={hasKidsOrPets === "no"}
                  className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                    hasKidsOrPets === "no" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm" 
                      : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:border-[#1c1c1c]/10"
                  }`}
                >
                  <Smile size={32} className={`mb-3 ${hasKidsOrPets === "no" ? "text-amber-600" : "text-[#1c1c1c]/40"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Нет</span>
                  <span className="text-[9px] text-[#1c1c1c]/40 mt-1.5 uppercase tracking-widest">живу один или только взрослые</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === "results" && (
            <motion.div key="step-results" {...slideVariants} className="flex flex-col gap-6 w-full">
              <p className="text-[#1c1c1c]/70 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-6">
                Мы сопоставили ваши ответы с характерами, энергичностью и поведением наших подопечных. Вот топ-3 кандидата с максимальной совместимостью!
              </p>

              {results.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
                  {results.map(({ pet, matchPercentage }, index) => (
                    <motion.li
                      key={pet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-white rounded-3xl border border-[#1c1c1c]/5 overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_25px_rgb(0,0,0,0.05)] transition-all h-full"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                        <Image
                          src={pet.image}
                          alt={pet.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        
                        {/* High compatibility premium pill */}
                        <div className="absolute top-3 left-3 bg-[#1c1c1c]/90 text-amber-400 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                          <Sparkles size={9} className="text-amber-400 animate-pulse" />
                          <span>{matchPercentage}% СОВМЕСТИМОСТЬ</span>
                        </div>

                        {/* Rank Circle */}
                        <div className="absolute bottom-3 right-3 bg-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-[#1c1c1c] shadow-xs">
                          #{index + 1}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-serif leading-tight text-[#1c1c1c] mb-1 group-hover:text-amber-500 transition-colors">
                            {pet.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#1c1c1c]/45 mb-3">
                            <span>{pet.species}</span>
                            <span className="w-1 h-1 rounded-full bg-black/10" />
                            <span>{pet.breed}</span>
                          </div>
                          <p className="text-[#1c1c1c]/50 text-xs font-light line-clamp-2">
                            {pet.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-[#1c1c1c]/5">
                          <Link
                            href={`/pets/${pet.id}`}
                            className="w-full py-3.5 sm:py-2.5 rounded-xl bg-[#2e2620] text-white hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-colors flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                          >
                            <Bookmark size={12} /> Подробнее
                          </Link>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="py-12 text-center w-full bg-white rounded-3xl border border-black/5">
                  <PawPrint size={40} className="text-black/10 mx-auto mb-3" />
                  <h4 className="font-serif text-[#1c1c1c] text-lg mb-1">Совпадений не найдено</h4>
                  <p className="text-[#1c1c1c]/50 text-xs max-w-sm mx-auto">
                     К сожалению, под выбранные параметры сейчас нет свободных питомцев. Попробуйте сбросить критерии или изменить их!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls Footer */}
        {step !== "results" && (
          <div className="flex items-center justify-between border-t border-[#1c1c1c]/5 pt-6 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden rounded-lg px-2 py-1 ${
                step === 1 
                  ? "text-[#1c1c1c]/20 cursor-not-allowed" 
                  : "text-[#1c1c1c]/60 hover:text-[#1c1c1c] cursor-pointer"
              }`}
            >
              <ArrowLeft size={12} /> Назад
            </button>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 sm:px-5 sm:py-2.5 rounded-full text-[#1c1c1c]/50 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all text-[9px] sm:text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  Закрыть
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#2e2620] text-white hover:bg-amber-500 px-6 py-3 sm:px-6 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>{step === 4 ? "Показать совпадения" : "Далее"}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

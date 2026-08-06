"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { CensusPet } from "@/lib/api/services/pet-stats";

type Lens = "all" | "shelter" | "home" | "year";

/**
 * Поле подопечных: диаграмма, собранная из настоящих морд.
 *
 * Переключатель не фильтрует список, а приглушает неподходящих — так видно и
 * долю, и целое одновременно. Каждый кружок ведёт на страницу питомца.
 */
export function PetCensus({ pets }: { pets: CensusPet[] }) {
  const [lens, setLens] = useState<Lens>("all");
  const [year, setYear] = useState<number | undefined>(undefined);

  const years = useMemo(
    () => [...new Set(pets.map((pet) => pet.intakeYear).filter((value): value is number => Boolean(value)))].sort(),
    [pets],
  );

  const counts = useMemo(
    () => ({
      all: pets.length,
      shelter: pets.filter((pet) => pet.status === "shelter").length,
      home: pets.filter((pet) => pet.status === "home").length,
    }),
    [pets],
  );

  const isHighlighted = (pet: CensusPet) => {
    if (lens === "all") return true;
    if (lens === "shelter") return pet.status === "shelter";
    if (lens === "home") return pet.status === "home";
    return pet.intakeYear === year;
  };

  const select = (next: Lens, nextYear?: number) => {
    setLens(next);
    setYear(nextYear);
  };

  if (pets.length === 0) return null;

  return (
    <>
      <div className="reports-tabs" role="group" aria-label="Разрез переписи">
        <button type="button" aria-pressed={lens === "all"} onClick={() => select("all")}>
          Все {counts.all}
        </button>
        <button type="button" aria-pressed={lens === "shelter"} onClick={() => select("shelter")}>
          Ищут дом · {counts.shelter}
        </button>
        <button type="button" aria-pressed={lens === "home"} onClick={() => select("home")}>
          Нашли дом · {counts.home}
        </button>
        {years.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={lens === "year" && year === value}
            onClick={() => select("year", value)}
          >
            {value}
          </button>
        ))}
      </div>

      <ul className="reports-field">
        {pets.map((pet) => {
          const highlighted = isHighlighted(pet);
          return (
            <li key={pet.documentId}>
              <a
                className={[
                  "reports-face",
                  highlighted ? "" : "reports-face--dimmed",
                  pet.status === "home" ? "reports-face--marked" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                href={`/pets/${pet.documentId}`}
                title={`${pet.name}${pet.intakeYear ? ` · под опекой с ${pet.intakeYear}` : ""}`}
              >
                {pet.photo ? (
                  <Image src={pet.photo} alt={pet.name} fill sizes="80px" style={{ objectFit: "cover" }} />
                ) : (
                  <span className="reports-face-initial" aria-hidden="true">
                    {pet.name.slice(0, 1)}
                  </span>
                )}
                <span className="sr-only">{pet.name}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="reports-census-note">
        Янтарным кольцом отмечены те, кто уже дома. Клик по любому кружку открывает страницу питомца.
      </p>
    </>
  );
}

"use client";

import Image from "next/image";
import { memo, useId, useMemo, useState } from "react";
import type { CensusPet } from "@/lib/api/services/pet-stats";

type Lens = "all" | "shelter" | "home" | "year";

/**
 * Сетка кружков. Вынесена в memo и ничего не знает о выбранном разрезе:
 * подсветку делает CSS по data-атрибутам обёртки, поэтому переключение
 * вкладки меняет один атрибут вместо перерисовки восьми десятков элементов.
 */
const CensusField = memo(function CensusField({
  pets,
  failed,
  onFail,
}: {
  pets: CensusPet[];
  failed: readonly string[];
  onFail: (documentId: string) => void;
}) {
  return (
    <ul className="reports-field">
      {pets.map((pet, index) => {
        // первые тридцать кружков грузим сразу, остальные по мере прокрутки:
        // восемь десятков одновременных запросов забивают очередь браузера
        const eager = index < 30;
        const broken = failed.includes(pet.documentId);
        return (
          <li key={pet.documentId}>
            <a
              className="reports-face"
              data-status={pet.status}
              data-year={pet.intakeYear ?? ""}
              href={`/pets/${pet.documentId}`}
              title={`${pet.name}${pet.intakeYear ? ` · под опекой с ${pet.intakeYear}` : ""}`}
            >
              {pet.photo && !broken ? (
                <Image
                  src={pet.photo}
                  alt={pet.name}
                  width={160}
                  height={160}
                  loading={eager ? "eager" : "lazy"}
                  onError={() => onFail(pet.documentId)}
                />
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
  );
});

/**
 * Поле подопечных: диаграмма, собранная из настоящих морд.
 *
 * Переключатель не фильтрует список, а приглушает неподходящих — так видно и
 * долю, и целое одновременно. Каждый кружок ведёт на страницу питомца.
 */
export function PetCensus({ pets }: { pets: CensusPet[] }) {
  const [lens, setLens] = useState<Lens>("all");
  const [year, setYear] = useState<number | undefined>(undefined);
 /** Фото, которых нет на диске: показываем букву имени вместо битой картинки. */
 const [failed, setFailed] = useState<readonly string[]>([]);
  const styleId = useId().replace(/[^a-zA-Z0-9]/g, "");

  const years = useMemo(
    () => [...new Set(pets.map((pet) => pet.intakeYear).filter((value): value is number => Boolean(value)))]
      // без компаратора сравнение идёт как у строк, и любой год не из четырёх цифр встанет не туда
      .toSorted((left, right) => left - right),
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

  /* Разрез по году сравнивает два атрибута, а такого селектора в CSS нет:
     на каждый известный год пишем собственное правило. */
  const yearRules = useMemo(
    () => years
      .map((value) => `[data-census="${styleId}"][data-lens="year"][data-year="${value}"] .reports-face:not([data-year="${value}"]){opacity:.24;filter:grayscale(1)}`)
      .join(""),
    [years, styleId],
  );

  const markFailed = useMemo(
    () => (documentId: string) => setFailed((current) => (current.includes(documentId) ? current : [...current, documentId])),
    [],
  );

  if (pets.length === 0) return null;

  const options: { key: string; label: string; lens: Lens; year?: number }[] = [
    { key: "all", label: `Все ${counts.all}`, lens: "all" },
    { key: "shelter", label: `Ищут дом · ${counts.shelter}`, lens: "shelter" },
    { key: "home", label: `Нашли дом · ${counts.home}`, lens: "home" },
    ...years.map((value) => ({ key: String(value), label: String(value), lens: "year" as Lens, year: value })),
  ];

  return (
    <>
      <style>{yearRules}</style>

      {/* Выбор взаимоисключающий, поэтому это переключатель, а не набор
          независимых кнопок: скринридер объявит «такой-то из шести». */}
      <div className="reports-tabs" role="radiogroup" aria-label="Разрез переписи">
        {options.map((option) => {
          const checked = option.lens === lens && option.year === year;
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => { setLens(option.lens); setYear(option.year); }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div data-census={styleId} data-lens={lens} data-year={year ?? ""}>
        <CensusField pets={pets} failed={failed} onFail={markFailed} />
      </div>

      <p className="reports-census-note">
 Янтарное кольцо значит «уже дома». Нажмите на любой кружок, и откроется страница питомца.
 </p>
    </>
  );
}

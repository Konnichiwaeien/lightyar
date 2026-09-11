import Image from "next/image";
import type { PetStats } from "@/lib/reports/pet-stats";
import type { CensusPet } from "@/lib/api/services/pet-stats";

/**
 * Итог за всё время, разложенный по годам поступления.
 *
 * Ширины колонок заданы в fr пропорционально числу поступивших, а высота у всех
 * плиток одна — поэтому площадь плитки равна показателю не приблизительно, а точно.
 * Разрез по статусу для этой роли не годится: доли 91/9 вырождают картинку в одну плитку.
 */
export function IntakeTreemap({ stats, pets }: { stats: PetStats; pets: CensusPet[] }) {
  const years = stats.years.filter((slice) => slice.intake > 0);
  if (years.length === 0) return null;

  const columns = years.map((slice) => `${slice.intake}fr`).join(" ");

  const photoForYear = (year: number) =>
    pets.find((pet) => pet.intakeYear === year && pet.cover)?.cover;

  return (
    <div className="reports-treemap-host">
      <ol className="reports-treemap" style={{ gridTemplateColumns: columns }}>
        {years.map((slice) => {
          const photo = photoForYear(slice.year);
          return (
            <li key={slice.year} style={{ display: "contents" }}>
              {/* вес несёт пропорцию в столбик: на узком экране высота заменяет ширину */}
              <a
                className="reports-tile"
                href={`/reports/${slice.year}`}
                style={{ "--tile-weight": slice.intake } as React.CSSProperties}
              >
                {photo ? (
                  <Image
                    src={photo}
                    alt={`Подопечный, попавший в фонд в ${slice.year} году`}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : null}
                <span className="reports-tile-body">
                  <b className="reports-num">{slice.intake}</b>
                  <span>поступили за {slice.year} год</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>

    </div>
  );
}

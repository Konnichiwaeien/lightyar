import Image from "next/image";
import Link from "next/link";
import type { YearReport } from "@/lib/reports/year-report";
import { plural } from "@/lib/reports/shelter-scales";

const when = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

/**
 * Кто пришёл в этом году: портреты с именем и датой поступления.
 *
 * Каждый ведёт на свою карточку, поэтому за цифрой из отчёта стоит живое
 * животное, которое можно открыть. Прячется, если в году никто не поступал.
 */
export function YearArrivals({ data }: { data: YearReport }) {
  const shots = data.arrived.filter((pet) => pet.cover || pet.photo);
  if (shots.length === 0) return null;

  return (
    <section className="reports-arrivals" aria-labelledby="arrivals-title">
      <div className="reports-wrap">
        <h2 id="arrivals-title">
          Кто пришёл <span className="reports-mark">в этом году</span>
        </h2>
        <p className="reports-arrivals-lead">
          <strong>
            {shots.length} {plural(shots.length, "карточка", "карточки", "карточек")}
          </strong>{" "}
          из базы приюта. Нажмите на любую, откроется страница подопечного.
        </p>

        <ul className="reports-arrivals-grid">
          {data.arrived.map((pet, index) => (
            <li key={pet.documentId} style={{ "--i": index } as React.CSSProperties}>
              <Link href={`/pets/${pet.slug || pet.documentId}`} className="reports-arrival">
                <span className="reports-arrival-frame">
                  {pet.cover || pet.photo ? (
                    <Image src={(pet.cover || pet.photo)!} alt="" fill sizes="(max-width: 700px) 45vw, 20vw" />
                  ) : (
                    <i aria-hidden="true">{pet.name.slice(0, 1)}</i>
                  )}
                </span>
                <b>{pet.name}</b>
                {pet.intakeDate ? <small>{when.format(new Date(pet.intakeDate))}</small> : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

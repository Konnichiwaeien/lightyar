import Image from "next/image";
import type { CensusPet } from "@/lib/api/services/pet-stats";
import { buildAgeGroups, buildWaitStats, plural } from "@/lib/reports/shelter-scales";
import { CountUp } from "./count-up";

/**
 * Шкалы-сцены: у каждой цифры свой предмет из жизни приюта.
 *
 * Приём подсмотрен в отчётах Дайлапии (kadence-child): там шкала не график,
 * а сцена, где величину несёт предмет. Здесь это будки и натянутый поводок.
 * Предметы подключены масками из public/reports/marks, поэтому красятся
 * нашим янтарём и меняют цвет вместе с темой.
 *
 * Числа приходят из карточек животных: ни одно значение не задано в разметке
 * руками. Ни одной линейки: раньше факты стояли в таблице с линиями, и блок
 * читался как ведомость, а не как сцена.
 */
export function ShelterScales({ pets }: { pets: CensusPet[] }) {
  const ages = buildAgeGroups(pets);
  const wait = buildWaitStats(pets);
  if (ages.length === 0) return null;

  const widest = Math.max(...ages.map((group) => group.count));

  return (
    <section className="reports-scales" aria-labelledby="scales-title">
      <div className="reports-wrap">
        <h2 id="scales-title">
          Кто живёт в приюте <span className="reports-mark">прямо сейчас</span>
        </h2>

        {/* Возраст: будка на группу. Сторона будки растёт как корень из доли,
            поэтому сравниваются площади, а не ширины. В лазу горит свет:
            будка обитаема, и цифра под ней это её жильцы. */}
        <figure className="reports-kennels">
          <ol>
            {ages.map((group, index) => (
              <li key={group.key} style={{ "--size": Math.sqrt(group.count / widest), "--i": index } as React.CSSProperties}>
                <span className="reports-kennel" aria-hidden="true">
                  <i className="reports-kennel-light" />
                  <i className="reports-kennel-body" />
                </span>
                <b>
                  <CountUp value={group.count} />
                </b>
                <span>{group.label}</span>
              </li>
            ))}
          </ol>
        </figure>

        {/* Сроки ожидания фактами: линейка-поводок растягивалась на всю ширину
            и читалась как украшение, а не как шкала. */}
        <figure className="reports-leash">
          <figcaption>Сколько идёт дорога домой</figcaption>
          <ul className="reports-facts">
            {wait.medianDays !== undefined ? (
              <li className="reports-fact--icon" style={{ "--i": 0 } as React.CSSProperties}>
                <i className="reports-fact-ico" data-icon="hourglass" aria-hidden="true" />
                <b>
                  <CountUp value={wait.medianDays} />
                  <small>{plural(wait.medianDays, "день", "дня", "дней")}</small>
                </b>
                <span>половина уехала домой быстрее</span>
              </li>
            ) : null}
            <li className="reports-fact--icon" style={{ "--i": 1 } as React.CSSProperties}>
              <i className="reports-fact-ico" data-icon="kennel" aria-hidden="true" />
              <b>
                <CountUp value={wait.overYear} />
                <small>из {wait.waiting}</small>
              </b>
              <span>ждут дом дольше года</span>
            </li>
            {wait.longest ? (
              <li className="reports-fact--photo" style={{ "--i": 2 } as React.CSSProperties}>
                {wait.longest.cover ? (
                  <span className="reports-fact-photo">
                    <Image src={wait.longest.cover} alt="" width={320} height={320} sizes="160px" />
                  </span>
                ) : null}
                <b>
                  <CountUp value={wait.longest.days} />
                  <small>{plural(wait.longest.days, "день", "дня", "дней")}</small>
                </b>
                <span>дольше всех ждёт {wait.longest.name}</span>
              </li>
            ) : null}
          </ul>
        </figure>

      </div>
    </section>
  );
}

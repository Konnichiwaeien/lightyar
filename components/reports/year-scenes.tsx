import Image from "next/image";
import type { YearReport } from "@/lib/reports/year-report";
import { plural } from "@/lib/reports/shelter-scales";
import { CountUp } from "./count-up";

/**
 * Две сцены года, которые оживают по прокрутке.
 *
 * Движение считает браузер по проходу секции через экран: собака идёт по
 * тропе, поршень шприца выдвигается. Назад всё разматывается тем же путём,
 * при системной настройке «меньше движения» предметы просто стоят на месте.
 */

/**
 * Дорога домой: собака идёт по тропе, за ней ложатся следы.
 *
 * Считаем по тем, кто пришёл в этом году и уже дома: уехать они могли и
 * позже, но путь начался здесь. Прячется, если домой пока никто не уехал.
 */
export function YearWalkHome({ data }: { data: YearReport }) {
  const walks = data.homeWalks;
  if (walks.length === 0) return null;

  const longest = walks[walks.length - 1];
  const shortest = walks[0];
  const median = walks[Math.floor(walks.length / 2)];

  return (
    <section className="reports-walk" aria-labelledby="walk-title">
      <div className="reports-wrap">
        <h2 id="walk-title">
          Дорога <span className="reports-mark">домой</span>
        </h2>
        <p className="reports-breakdown-lead">
          <strong>
            {walks.length} {plural(walks.length, "подопечный", "подопечных", "подопечных")}
          </strong>{" "}
          из поступивших в {data.year} году уже дома. Путь считаем от дня поступления до дня переезда.
        </p>

        <div className="reports-walk-scene" aria-hidden="true">
          <span className="reports-walk-path" />
          <span className="reports-walk-dog" />
        </div>

        <ul className="reports-facts reports-walk-facts">
          {[
            { key: "short", pet: shortest, label: `быстрее всех: ${shortest.name}` },
            ...(walks.length > 2 ? [{ key: "median", pet: median, label: "середина пути у остальных" }] : []),
            { key: "long", pet: longest, label: `дольше всех: ${longest.name}` },
          ].map((fact, index) => (
            <li key={fact.key} className="reports-fact--photo" style={{ "--i": index } as React.CSSProperties}>
              {fact.pet.cover ? (
                <span className="reports-fact-photo">
                  <Image src={fact.pet.cover} alt="" width={320} height={320} sizes="160px" />
                </span>
              ) : null}
              <b>
                <CountUp value={fact.pet.days} />
                <small>{plural(fact.pet.days, "день", "дня", "дней")}</small>
              </b>
              <span>{fact.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Лечение и стерилизация: поршень шприца идёт по прокрутке.
 *
 * Считаем по карточкам тех, кто оставался под опекой на конец года.
 * Прячется, если поле стерилизации не заполнено ни у кого.
 */
export function YearHealth({ data }: { data: YearReport }) {
  const { sterilized, total } = data.composition;
  if (total === 0 || sterilized === 0) return null;
  const share = Math.round((sterilized / total) * 100);

  return (
    <section className="reports-health" aria-labelledby="health-title">
      <div className="reports-wrap reports-health-stage">
        <div className="reports-health-copy">
          <h2 id="health-title">
            Лечение и <span className="reports-mark">стерилизация</span>
          </h2>
          <p>
            Приют не берёт животное просто на передержку. <strong>Сначала осмотр, прививки и стерилизация</strong>,
            потом поиск дома. У каждого, кого успели подготовить, в карточке стоит отметка.
          </p>

          <p className="reports-health-figure">
            <b className="reports-num">
              <CountUp value={sterilized} /> <small>из {total}</small>
            </b>
            <span>
              подопечных под опекой уже стерилизованы, это <strong>{share}%</strong>
            </span>
          </p>
        </div>

        <div className="reports-health-scene" aria-hidden="true" style={{ "--fill": sterilized / total } as React.CSSProperties}>
          <span className="reports-health-body" />
          <span className="reports-health-dose" />
          <span className="reports-health-plunger" />
        </div>
      </div>
    </section>
  );
}

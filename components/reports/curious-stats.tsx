import Image from "next/image";
import type { ReactNode } from "react";
import type { CensusPet } from "@/lib/api/services/pet-stats";
import { buildCuriousStats } from "@/lib/reports/curious-stats";
import { plural } from "@/lib/reports/shelter-scales";
import { CountUp } from "./count-up";

/**
 * Цифры, которых нет в отчётах: мозаика плиток.
 *
 * Список «значок, цифра, подпись» читался как поток данных. Теперь это
 * мозаика, как перепись по годам и галерея: рекордсмены с настоящим фото
 * занимают большие плитки, остальные факты чередуют янтарь, чернила, мох,
 * глину и белый, значок стоит в потоке над цифрой и с ней не пересекается.
 * Плотная раскладка сама закрывает дыры, ряд растёт под длинную подпись.
 */
const when = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

/** Глагол и прилагательное по полу из карточки. */
const arrival = (sex?: string) =>
  sex === "female" ? "приехала последней" : sex === "male" ? "приехал последним" : "приехали последними";

interface Tile {
  key: string;
  tone: "amber" | "ink" | "moss" | "clay" | "card" | "photo";
  span?: "big" | "wide" | "tall";
  icon?: string;
  photo?: string;
  value: ReactNode;
  unit?: string;
  label: string;
}

export function CuriousStats({ pets }: { pets: CensusPet[] }) {
  if (pets.length === 0) return null;
  const c = buildCuriousStats(pets);

  const tiles: Tile[] = [];
  if (c.oldest) {
    tiles.push({
      key: "oldest",
      tone: c.oldest.cover ? "photo" : "card",
      span: "big",
      photo: c.oldest.cover,
      value: <CountUp value={c.oldest.value} />,
      unit: plural(c.oldest.value, "год", "года", "лет"),
      label: `самый старший житель: ${c.oldest.name}`,
    });
  }
  if (c.newest) {
    tiles.push({
      key: "newest",
      tone: c.newest.cover ? "photo" : "card",
      span: "tall",
      photo: c.newest.cover,
      value: <span className="reports-curio-date">{when.format(new Date(c.newest.date))}</span>,
      label: `${arrival(c.newest.sex)}: ${c.newest.name}`,
    });
  }
  tiles.push({
    key: "waiting",
    tone: "amber",
    icon: "hourglass",
    value: <CountUp value={c.waitingYears} />,
    unit: plural(c.waitingYears, "год", "года", "лет"),
    label: "суммарно ждут дом все, кто сейчас в приюте",
  });
  if (c.averageWaitDays !== undefined) {
    tiles.push({
      key: "average",
      tone: "moss",
      icon: "clock",
      value: <CountUp value={c.averageWaitDays} />,
      unit: plural(c.averageWaitDays, "день", "дня", "дней"),
      label: "в среднем живёт в приюте тот, кто ещё ждёт",
    });
  }
  if (c.heaviest) {
    tiles.push({
      key: "heaviest",
      tone: c.heaviest.cover ? "photo" : "card",
      span: "wide",
      photo: c.heaviest.cover,
      value: <CountUp value={c.heaviest.value} />,
      unit: "кг",
      label: `самый крупный: ${c.heaviest.name}`,
    });
  }
  tiles.push({ key: "senior", tone: "card", icon: "glasses", value: <CountUp value={c.overTen} />, label: "подопечных старше десяти лет" });
  if (c.weightTotal !== undefined) {
    tiles.push({ key: "weight", tone: "clay", icon: "scales", value: <CountUp value={c.weightTotal} />, unit: "кг", label: "весят все подопечные вместе" });
  }
  tiles.push({ key: "photos", tone: "ink", icon: "camera", value: <CountUp value={c.photos} />, label: "фотографий в карточках" });
  if (c.topLetter) {
    tiles.push({
      key: "letter",
      tone: "card",
      icon: "tag",
      value: <CountUp value={c.topLetter.count} />,
      unit: `из ${pets.length}`,
      label: `имён начинаются на «${c.topLetter.letter}»`,
    });
  }
  if (c.busiestDay) {
    tiles.push({
      key: "weekday",
      tone: "moss",
      icon: "calendar-grid",
      value: <CountUp value={c.busiestDay.count} />,
      label: `поступлений пришлось на ${c.busiestDay.label}, больше любого другого дня`,
    });
  }
  tiles.push({
    key: "season",
    tone: "amber",
    icon: "snowflake",
    value: <CountUp value={c.winterIntake} />,
    unit: `против ${c.summerIntake}`,
    label: "зимой приносят чаще, чем летом",
  });

  return (
    <section className="reports-curious" aria-labelledby="curious-title">
      <div className="reports-wrap">
        <h2 id="curious-title">
          Цифры, которых <span className="reports-mark">нет в отчётах</span>
        </h2>
        <p className="reports-curious-lead">
          В форму для Минюста это не попадает, а о приюте рассказывает больше любой сводки. Всё посчитано по карточкам
          подопечных.
        </p>

        <ul className="reports-curio-grid">
          {tiles.map((tile, index) => (
            <li
              key={tile.key}
              className="reports-curio"
              data-tone={tile.tone}
              data-span={tile.span}
              style={{ "--i": index } as React.CSSProperties}
            >
              {tile.photo ? (
                <>
                  <Image src={tile.photo} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
                  <span className="reports-curio-scrim" aria-hidden="true" />
                </>
              ) : null}
              {tile.icon ? <i className="reports-fact-ico reports-curio-ico" data-icon={tile.icon} aria-hidden="true" /> : null}
              <b>
                {tile.value}
                {tile.unit ? <small>{tile.unit}</small> : null}
              </b>
              <span>{tile.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

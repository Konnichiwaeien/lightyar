import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { PledgeField } from "@/lib/campaigns/pledges";
import { plural } from "@/lib/reports/shelter-scales";

/**
 * Сцена страницы сборов: поле взносов.
 *
 * Все открытые сборы разложены на метки одного размера. Метка это взнос в
 * 500 ₽, тот самый, что подставляет кнопка «Помочь». Оплаченные метки горят
 * янтарём и зажигаются по прокрутке одна за другой, свободные стоят пустыми
 * кольцами, а на границе между ними светится ближайшая свободная: место
 * следующего взноса.
 *
 * Почему не доля. Собрано от 2 до 21 процента, и сцена, которая рисует долю
 * площадью, на таких числах читается как незагрузившаяся картинка. Счёт
 * взносов от доли не зависит: поле стоит полным с первого кадра, а «38
 * сделано, 512 ждут» остаётся внятным при любом проценте.
 *
 * Метки нарисованы узлами, а не паттерном фона: очередь появления и место
 * следующего взноса нужны поимённо, а раскладка на любой ширине достаётся
 * даром от auto-fill. Анимаций при этом столько, сколько оплаченных меток,
 * а не сколько меток всего.
 */

/** Отрезок, внутри которого расходится очередь оплаченных меток, в процентах. */
const QUEUE_SPAN = 32;

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/**
 * Строка о том, из чего сложилось собранное.
 *
 * Счёт взносов называется только тогда, когда он сошёлся с деньгами: иначе
 * часть взносов прошла мимо CMS, и сумма со счётом разъедутся на глазах у
 * читателя. Имена приходят из хранилища и ставятся как есть.
 */
function madeOf(field: PledgeField): string {
  const sum = money(field.got);

  if (field.pledges <= 0) return `Это ${sum} на всех открытых сборах.`;

  const times = `${field.pledges} ${plural(field.pledges, "раз", "раза", "раз")}`;
  if (field.donors.length === 0) return `Это ${sum}, которые внесли ${times}.`;

  const names = field.donors.join(", ");
  const tail = field.anonymous ? " и те, кто не назвался" : "";
  return `Это ${sum}, которые внесли ${times}: ${names}${tail}.`;
}

export function CampaignPledges({ field }: { field: PledgeField }) {
  /* Шаг очереди считается от числа оплаченных меток: с постоянным шагом
     триста взносов уехали бы далеко за конец отрезка и половина поля
     зажглась бы уже за кадром. */
  const step = field.taken > 1 ? QUEUE_SPAN / (field.taken - 1) : 0;

  const marks = Array.from({ length: field.places }, (_, index) => {
    if (index < field.taken) {
      return <i data-got="" key={index} style={{ "--i": index } as React.CSSProperties} />;
    }
    return <i data-next={index === field.taken ? "" : undefined} key={index} />;
  });

  return (
    <section
      aria-labelledby="camp-pledges-title"
      className="camp-pledges"
      style={{ "--step": `${step.toFixed(4)}%` } as React.CSSProperties}
    >
      <div className="camp-inner">
        <div className="camp-pledges__head">
          <div>
            <p className="camp-kicker">Одна метка равна взносу в {money(field.unit)}</p>
            <h2 id="camp-pledges-title">
              {field.funds} {plural(field.funds, "открытый сбор", "открытых сбора", "открытых сборов")}
              <em>
                это {field.places} {plural(field.places, "взнос", "взноса", "взносов")}
              </em>
            </h2>
          </div>
          <p className="camp-pledges__lead">
            {field.taken} из них уже {plural(field.taken, "сделан", "сделаны", "сделаны")}. {madeOf(field)}
          </p>
        </div>

        <div className="camp-pledges__stage">
          <span aria-hidden="true" className="camp-pledges__light" />
          {/* Читалке метки не нужны поштучно: роль картинки прячет их все,
              а подпись называет те же числа словами. */}
          <div
            aria-label={`Поле из ${field.places} меток, каждая метка это взнос в ${field.unit} рублей. Оплачено ${field.taken}, свободно ${field.free}.`}
            className="camp-pledges__field"
            role="img"
          >
            {marks}
          </div>
          <span aria-hidden="true" className="camp-pledges__shade" />
        </div>

        <div className="camp-pledges__foot">
          <p className="camp-pledges__rest">
            <b>{field.free}</b>
            <span>
              {plural(field.free, "взнос", "взноса", "взносов")} до того, как закроются все сборы. Ближайший
              свободный обведён янтарём.
            </span>
          </p>
          <Link className="camp-btn camp-pledges__cta" href="/#donate">
            Сделать следующий взнос
            <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

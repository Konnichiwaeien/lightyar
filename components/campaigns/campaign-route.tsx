import type { RouteStation } from "@/lib/campaigns/summary";

/**
 * Секция 3 страницы сборов: лента «Куда уходит взнос».
 *
 * Одна длинная картина едет влево, пока читатель прокручивает страницу вниз.
 * По пути он проходит станции: монета, четыре нужды приюта, в конце собака у
 * полной миски. Подпись станции проявляется, когда станция подходит к середине
 * экрана, и несёт настоящую сумму, собранную по этому тегу.
 *
 * Почему CSS, а не framer. Первый заход был на framer, и он падал: библиотека
 * отдаёт такие значения браузеру нативной шкалой прокрутки, кадры там считаются
 * от её собственных отрезков, и инлайновый стиль, который она же пишет,
 * перебивается этой анимацией. Значения расходились с расчётом, а на смещениях
 * вне диапазона от нуля до единицы страница целиком уходила в заглушку ошибки.
 *
 * На CSS ветвления не нужно вовсе: каждый элемент двигает своё свойство по
 * шкале, объявленной секцией, а момент подписи приходит числом из данных. Ни
 * клиентского кода, ни замеров, ни гидратации. Скилл scroll-scenes держит CSS
 * движком по умолчанию именно поэтому.
 *
 * Замысел в docs/campaigns-scroll-plan.md, секция 3. Бриф на картину в
 * docs/asset-brief-campaigns-ribbon.md.
 */

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/**
 * Временная замена картины.
 *
 * Пока не пришёл `ribbon.webp` по брифу, станции собраны из предметов вишлиста
 * на кремовой полосе. Годится, чтобы смотреть ход ленты и моменты подписей, и
 * не годится, чтобы судить о картине: предметы сняты для другой задачи, между
 * собой не связаны и стоят на разных линиях.
 */
const STAND_IN = [
  { at: 0.05, src: "/wishlist/item-parcel.webp" },
  { at: 0.22, src: "/wishlist/item-dry-food.webp" },
  { at: 0.39, src: "/wishlist/item-medicine.webp" },
  { at: 0.56, src: "/wishlist/item-vitamins.webp" },
  { at: 0.73, src: "/wishlist/item-blanket.webp" },
  { at: 0.92, src: "/wishlist/item-bowl.webp" },
];

export function CampaignRoute({ stations, unit }: { stations: RouteStation[]; unit: number }) {
  return (
    <section aria-labelledby="camp-route-title" className="camp-route">
      <div className="camp-route__sticky">
        <div className="camp-inner camp-route__head">
          <p className="camp-kicker">Куда уходит взнос</p>
          <h2 id="camp-route-title">
            {money(unit)} доезжают
            <em>до миски</em>
          </h2>
        </div>

        <div className="camp-route__track">
          <div className="camp-route__strip">
            {/* eslint-disable @next/next/no-img-element */}
            {STAND_IN.map((item) => (
              <img
                alt=""
                aria-hidden="true"
                className="camp-route__thing"
                key={item.src}
                loading="lazy"
                src={item.src}
                style={{ left: `${item.at * 100}%` }}
              />
            ))}
            {/* eslint-enable @next/next/no-img-element */}

            {stations.map((station) => (
              <figure
                className="camp-route__station"
                key={station.tag}
                style={
                  {
                    left: `${station.at * 100}%`,
                    "--say": station.say,
                  } as React.CSSProperties
                }
              >
                <figcaption>{station.tag}</figcaption>
                <b>{money(station.collected)}</b>
                <span>уже собрано</span>
              </figure>
            ))}
          </div>

          <span aria-hidden="true" className="camp-route__glow" />
        </div>
      </div>
    </section>
  );
}

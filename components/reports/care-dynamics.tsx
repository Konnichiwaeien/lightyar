"use client";

import { useState } from "react";
import Image from "next/image";
import type { QuarterSlice } from "@/lib/reports/care-dynamics";

/**
 * Как менялась помощь: линейный график по кварталам плюс два кадра с числами.
 *
 * Конструкция взята из общей страницы отчётности темы kadence-child
 * (demo/public-reports-hub-v3, секция impact): слева серии с подписанными
 * точками и переключаемой легендой, справа фотографии, на которых крупно
 * стоит итог. Ни одного растрового ассета: линии, сетка и точки рисуются
 * в SVG, поэтому график остаётся резким на любом экране.
 *
 * Шаг квартальный, а не месячный: за 22 месяца работы пристройства случались
 * в пяти месяцах, и на месячной сетке линия «нашли дом» почти всё время
 * лежала бы на нуле.
 */

const SERIES = [
  // Подпись верхней серии стоит над точкой, нижней под точкой: в кварталах,
  // где линии сходятся, числа иначе наезжают друг на друга.
  { key: "intake" as const, label: "Поступили", color: "var(--ink)", shift: -12 },
  { key: "adopted" as const, label: "Нашли дом", color: "var(--amber-text)", shift: 20 },
];

/** Кадр графика. Подписи значений живут над точками, поэтому сверху запас. */
const VB = { width: 700, height: 300, left: 34, right: 688, top: 26, bottom: 246 };

/** Квартал словами для подписи: «первый квартал 2025». */
const QUARTERS = ["первый", "второй", "третий", "четвёртый"];
const spell = (key: string) => {
  const [year, quarter] = key.split("-");
  return `${QUARTERS[Number(quarter)]} квартал ${year}`;
};

/**
 * Клиентскому компоненту приходят только кварталы и два адреса фото:
 * полный список карточек с галереями тянул бы в разметку лишние килобайты.
 */
export function CareDynamics({ quarters, covers }: { quarters: QuarterSlice[]; covers: string[] }) {
  const [hidden, setHidden] = useState<string[]>([]);
  if (quarters.length < 2) return null;

  const peak = Math.max(...quarters.flatMap((q) => [q.intake, q.adopted]), 1);
  // Шаг сетки круглый: 2, 5 или 10 в зависимости от размаха.
  const step = peak > 24 ? 10 : peak > 10 ? 5 : 2;
  const top = Math.ceil(peak / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);

  const x = (index: number) => VB.left + ((VB.right - VB.left) / (quarters.length - 1)) * index;
  const y = (value: number) => VB.bottom - (value / top) * (VB.bottom - VB.top);

  const cover = (skip: number) => covers[skip];
  // Подписи под фото говорят о том, чего нет в других блоках: пиковые
  // кварталы. Общие 79 и 7 уже стоят в переписи и в диаграммах.
  const peakIntake = quarters.reduce((best, q) => (q.intake > best.intake ? q : best), quarters[0]);
  const peakAdopted = quarters.reduce((best, q) => (q.adopted > best.adopted ? q : best), quarters[0]);

  return (
    <section className="reports-dynamics" aria-labelledby="dynamics-title">
      <div className="reports-wrap reports-dynamics-inner">
        <div className="reports-dynamics-data">
          <h2 id="dynamics-title">
            Как менялась <span className="reports-mark">помощь</span>
          </h2>

          <div className="reports-dynamics-legend" role="group" aria-label="Показатели графика">
            {SERIES.map((series) => {
              const on = !hidden.includes(series.key);
              return (
                <button
                  key={series.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setHidden((list) => (list.includes(series.key) ? list.filter((k) => k !== series.key) : [...list, series.key]))
                  }
                >
                  <i style={{ background: series.color }} />
                  {series.label}
                </button>
              );
            })}
          </div>

          <div className="reports-dynamics-chart">
            <svg viewBox={`0 0 ${VB.width} ${VB.height}`} role="img" aria-label="Поступления и пристройства по кварталам">
              {ticks.map((value) => (
                <g key={value}>
                  <line className="reports-chart-grid" x1={VB.left} x2={VB.right} y1={y(value)} y2={y(value)} />
                  <text className="reports-chart-axis" x="0" y={y(value) + 4}>
                    {value}
                  </text>
                </g>
              ))}

              {quarters.map((quarter, index) => (
                <text key={quarter.label} className="reports-chart-axis" x={x(index)} y={VB.height - 8} textAnchor="middle">
                  {quarter.label}
                </text>
              ))}

              {SERIES.map((series) => (
                <g
                  key={series.key}
                  className="reports-chart-series"
                  data-muted={hidden.includes(series.key) ? "true" : "false"}
                >
                  <polyline
                    className="reports-chart-line"
                    stroke={series.color}
                    points={quarters.map((q, i) => `${x(i)},${y(q[series.key])}`).join(" ")}
                  />
                  {quarters.map((quarter, index) => (
                    <g key={quarter.label}>
                      <circle className="reports-chart-point" cx={x(index)} cy={y(quarter[series.key])} r="5" fill={series.color} />
                      {/* Ноль не подписываем: восемь нулей вдоль оси читаются
                          как шум и спорят с самой линией. */}
                      {quarter[series.key] > 0 ? (
                        <text
                          className="reports-chart-value"
                          x={x(index)}
                          y={y(quarter[series.key]) + series.shift}
                          textAnchor="middle"
                          fill={series.color}
                        >
                          {quarter[series.key]}
                        </text>
                      ) : null}
                    </g>
                  ))}
                </g>
              ))}
            </svg>
          </div>

          <p className="reports-dynamics-note">
            Приют работает с октября 2024 года. Поступления идут неровно: собак приносят и находят на улице круглый год,
            а дом находится долго, поэтому вторая линия поднимается медленнее первой.
          </p>
        </div>

        <div className="reports-dynamics-photos">
          <figure className="reports-dynamics-photo reports-dynamics-photo--wide">
            {cover(0) ? (
              <Image src={cover(0)!} alt="Подопечный приюта" width={1080} height={720} sizes="(max-width: 920px) 50vw, 25vw" />
            ) : null}
            <figcaption>
              <strong className="reports-num">{peakIntake.intake}</strong>
              <span>
                <b>пик поступлений</b>
                {spell(peakIntake.key)}
              </span>
            </figcaption>
          </figure>
          <figure className="reports-dynamics-photo">
            {cover(1) ? (
              <Image src={cover(1)!} alt="Подопечный приюта" width={760} height={900} sizes="(max-width: 920px) 50vw, 25vw" />
            ) : null}
            <figcaption>
              <strong className="reports-num">{peakAdopted.adopted}</strong>
              <span>
                <b>рекорд пристройств</b>
                {spell(peakAdopted.key)}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

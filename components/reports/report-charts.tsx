"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Composition } from "@/lib/reports/shelter-scales";
import { plural } from "@/lib/reports/shelter-scales";
import { useMotionPreference } from "./use-motion-preference";

/**
 * Приют в разрезе: четыре кольца и сезонная кривая.
 *
 * Кольца показывают состав подопечных: вид, пол, сложение, стерилизация.
 * Кривая показывает, в какие месяцы года приносят чаще. Ни одно из этих
 * чисел не стоит в других блоках: общие «сколько ждут и сколько дома»
 * живут в переписи, хронология в графике по кварталам.
 */

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SHORT_MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const MONTHS_IN = [
  "январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре",
];

interface Segment {
  color: string;
  value: number;
  label: string;
  icon?: string;
}

function Donut({ segments, centerValue, centerLabel, shown }: { segments: Segment[]; centerValue: string; centerLabel: string; shown: boolean }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total === 0) return null;

  // Смещения считаем заранее: мутировать аккумулятор внутри render нельзя.
  const arcs = segments.reduce<{ color: string; fraction: number; offset: number }[]>((acc, segment) => {
    const previous = acc[acc.length - 1];
    const offset = previous ? previous.offset + previous.fraction : 0;
    acc.push({ color: segment.color, fraction: segment.value / total, offset });
    return acc;
  }, []);

  return (
    <div className="reports-donut-wrap">
      <svg className="reports-donut" viewBox="0 0 200 200" role="presentation">
        <circle cx="100" cy="100" r={RADIUS} stroke="var(--stone)" strokeWidth="22" opacity="0.25" />
        {arcs.map((arc) => {
          // Крошечная доля не должна уйти в отрицательную длину из-за зазора.
          const length = Math.max(arc.fraction * CIRCUMFERENCE - 2, arc.fraction > 0 ? 2 : 0);
          return (
            <motion.circle
              key={arc.color}
              cx="100"
              cy="100"
              r={RADIUS}
              stroke={arc.color}
              strokeWidth="22"
              strokeDashoffset={-arc.offset * CIRCUMFERENCE}
              initial={false}
              animate={{ strokeDasharray: `${shown ? length : 0} ${CIRCUMFERENCE}` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
      </svg>
      <div className="reports-donut-center">
        <b className="reports-num">{centerValue}</b>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

/** Легенда кольца: значок из серии масок в цвете сегмента, подпись, число.
 *  Пока файла значка нет, вместо него видна цветная точка: какие значки
 *  есть, знает только CSS, поэтому в разметке всегда оба. */
function Keys({ segments }: { segments: Segment[] }) {
  return (
    <div className="reports-keys">
      {segments
        .filter((segment) => segment.value > 0)
        .map((segment) => (
          <div className="reports-key" key={segment.label}>
            <span className="reports-key-mark" aria-hidden="true">
              {segment.icon ? <i className="reports-fact-ico" data-icon={segment.icon} style={{ background: segment.color }} /> : null}
              <i className="reports-key-dot" style={{ background: segment.color }} />
            </span>
            <span>{segment.label}</span>
            <b className="reports-num">{segment.value}</b>
          </div>
        ))}
    </div>
  );
}

/** Кривая по месяцам года: видно сезон, а не хронологию. */
function SeasonCurve({ monthly, shown }: { monthly: number[]; shown: boolean }) {
  const max = Math.max(...monthly, 1);
  const left = 14;
  const right = 306;
  const bottom = 150;
  const top = 40;
  const x = (index: number) => left + ((right - left) * index) / (monthly.length - 1);
  const y = (value: number) => bottom - ((bottom - top) * value) / max;
  const path = monthly.map((value, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(" ");
  const peak = monthly.indexOf(max);

  return (
    <div>
      <svg className="reports-curve" viewBox="0 0 320 160" role="img" aria-label="Поступления по месяцам года">
        <line className="reports-curve-grid" x1={left} y1={bottom} x2={right} y2={bottom} />
        <line className="reports-curve-grid" x1={left} y1={95} x2={right} y2={95} opacity="0.5" />
        <motion.path
          className="reports-curve-line"
          d={path}
          initial={false}
          animate={{ pathLength: shown ? 1 : 0 }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
        />
        <circle cx={x(peak)} cy={y(max)} r="5" fill="var(--amber-text)" />
      </svg>
      {/* Подписи в HTML, а не в SVG: иначе они масштабируются вместе с кривой. */}
      <div className="reports-curve-axis" aria-hidden="true">
        {SHORT_MONTHS.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  );
}

export function ReportCharts({ composition, monthly }: { composition: Composition; monthly: number[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const shown = reduced || inView;

  const species: Segment[] = [
    { color: "var(--ink)", value: composition.dogs, label: "Собаки", icon: "dog-head" },
    { color: "var(--amber-text)", value: composition.cats, label: "Кошки", icon: "cat" },
  ];
  const sex: Segment[] = [
    { color: "var(--amber-text)", value: composition.females, label: "Девочки", icon: "female" },
    { color: "var(--ink)", value: composition.males, label: "Мальчики", icon: "male" },
    { color: "var(--stone)", value: composition.unsexed, label: "Пол не указан" },
  ];
  const size: Segment[] = [
    { color: "var(--ink)", value: composition.large, label: "Крупные", icon: "large" },
    { color: "var(--amber-text)", value: composition.medium, label: "Средние", icon: "medium" },
    { color: "var(--clay)", value: composition.small, label: "Небольшие", icon: "small" },
  ];
  const sterilized: Segment[] = [
    { color: "var(--amber-text)", value: composition.sterilized, label: "Стерилизованы", icon: "sterilized" },
    { color: "var(--stone)", value: composition.total - composition.sterilized, label: "Пока нет" },
  ];

  const max = Math.max(...monthly, 0);
  const min = Math.min(...monthly);
  const peakMonths = monthly.map((value, index) => (value === max ? index : -1)).filter((index) => index >= 0);
  const quietMonth = monthly.indexOf(min);
  const hasSeason = monthly.some((value) => value > 0);

  return (
    <div className="reports-chart-grid" ref={ref}>
      <article className="reports-chart">
        <h3>Собаки и кошки</h3>
        <Donut shown={shown} segments={species} centerValue={String(composition.dogs)} centerLabel={plural(composition.dogs, "собака", "собаки", "собак")} />
        <Keys segments={species} />
      </article>

      <article className="reports-chart">
        <h3>Девочки и мальчики</h3>
        <Donut shown={shown} segments={sex} centerValue={String(composition.females)} centerLabel={plural(composition.females, "девочка", "девочки", "девочек")} />
        <Keys segments={sex} />
      </article>

      <article className="reports-chart">
        <h3>Какого они сложения</h3>
        <Donut shown={shown} segments={size} centerValue={String(composition.large)} centerLabel={plural(composition.large, "крупный", "крупных", "крупных")} />
        <Keys segments={size} />
      </article>

      <article className="reports-chart">
        <h3>Стерилизация</h3>
        <Donut shown={shown} segments={sterilized} centerValue={`${composition.sterilized}`} centerLabel={`из ${composition.total}`} />
        <Keys segments={sterilized} />
      </article>

      {hasSeason ? (
        <article className="reports-chart reports-chart--wide">
          <h3>В какие месяцы приносят</h3>
          <SeasonCurve monthly={monthly} shown={shown} />
          <div className="reports-keys">
            <div className="reports-key">
              <span className="reports-key-mark" aria-hidden="true">
                <i className="reports-key-dot" style={{ background: "var(--amber-text)" }} />
              </span>
              <span>Чаще всего в {peakMonths.map((index) => MONTHS_IN[index]).join(", ")}</span>
              <b className="reports-num">{max}</b>
            </div>
            <div className="reports-key">
              <span className="reports-key-mark" aria-hidden="true">
                <i className="reports-key-dot" style={{ background: "var(--stone)" }} />
              </span>
              <span>Тише всего в {MONTHS_IN[quietMonth]}</span>
              <b className="reports-num">{min}</b>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}

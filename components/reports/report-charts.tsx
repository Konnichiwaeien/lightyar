"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { PetStats } from "@/lib/reports/pet-stats";

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const SHORT_MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

const monthLabel = (value: string, short = false) => {
  const [year, month] = value.split("-");
  const names = short ? SHORT_MONTHS : MONTHS;
  return `${names[Number(month) - 1]} ${year}`;
};

function Donut({
  segments,
  centerValue,
  centerLabel,
  shown,
}: {
  segments: { color: string; value: number }[];
  centerValue: string;
  centerLabel: string;
  shown: boolean;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total === 0) return null;

  // смещения считаем заранее: мутировать аккумулятор внутри render нельзя
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
          // крошечная доля не должна уйти в отрицательную длину из-за зазора
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

/** Ломаная накопительных пристройств: каждая точка — конец месяца */
function AdoptionCurve({ stats, shown }: { stats: PetStats; shown: boolean }) {
  const points = stats.adoptionTimeline;
  if (points.length < 2) return null;

  const max = points[points.length - 1].total;
  const left = 14;
  const right = 306;
  const bottom = 150;
  const top = 40;

  const path = points
    .map((point, index) => {
      const x = left + ((right - left) * index) / (points.length - 1);
      const y = bottom - ((bottom - top) * point.total) / max;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="reports-curve" viewBox="0 0 320 190" role="img" aria-label={`Накопительно нашли дом: ${max}`}>
      <line className="reports-curve-grid" x1={left} y1={bottom} x2={right} y2={bottom} />
      <line className="reports-curve-grid" x1={left} y1={95} x2={right} y2={95} opacity="0.5" />
      <motion.path
        className="reports-curve-line"
        d={path}
        initial={false}
        animate={{ pathLength: shown ? 1 : 0 }}
        transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
      />
      <circle cx={right} cy={top} r="5" fill="var(--amber-text)" />
      <text x={left} y="172">
        {monthLabel(points[0].month, true)}
      </text>
      <text x={right} y="172" textAnchor="end">
        {monthLabel(points[points.length - 1].month, true)}
      </text>
    </svg>
  );
}

export function ReportCharts({ stats }: { stats: PetStats }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const shown = reduced || inView;

  const hasCurve = stats.adoptionTimeline.length >= 2;

  return (
    <div className="reports-chart-grid" ref={ref}>
      <article className="reports-chart">
        <h3>Где сейчас {stats.total} подопечных</h3>
        <Donut
          shown={shown}
          segments={[
            { color: "var(--moss)", value: stats.inCare },
            { color: "var(--amber-text)", value: stats.adopted },
          ]}
          centerValue={String(stats.total)}
          centerLabel="всего"
        />
        <div className="reports-keys">
          <div className="reports-key">
            <i style={{ background: "var(--moss)" }} />
            <span>Ищут дом</span>
            <b>{stats.inCare}</b>
          </div>
          <div className="reports-key">
            <i style={{ background: "var(--amber-text)" }} />
            <span>Нашли дом</span>
            <b>{stats.adopted}</b>
          </div>
          <div className="reports-key">
            <i style={{ background: "var(--clay)" }} />
            <span>Из них на лечении</span>
            <b>{stats.inTreatment}</b>
          </div>
        </div>
      </article>

      <article className="reports-chart">
        <h3>Кто под опекой</h3>
        <Donut
          shown={shown}
          segments={[
            { color: "var(--ink)", value: stats.dogs },
            { color: "var(--amber-text)", value: stats.cats },
          ]}
          centerValue={String(stats.dogs)}
          centerLabel="собак"
        />
        <div className="reports-keys">
          <div className="reports-key">
            <i style={{ background: "var(--ink)" }} />
            <span>Собаки</span>
            <b>{stats.dogs}</b>
          </div>
          <div className="reports-key">
            <i style={{ background: "var(--amber-text)" }} />
            <span>Кошки</span>
            <b>{stats.cats}</b>
          </div>
        </div>
      </article>

      {hasCurve ? (
        <article className="reports-chart">
          <h3>Сколько нашли дом, накопительно</h3>
          <AdoptionCurve stats={stats} shown={shown} />
          <div className="reports-keys">
            <div className="reports-key">
              <i style={{ background: "var(--amber-text)" }} />
              <span>Первое пристройство — {monthLabel(stats.adoptionTimeline[0].month)}</span>
              <b>+{stats.adopted}</b>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}

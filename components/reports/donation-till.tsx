"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FinancialSummary } from "@/lib/reports/normalize-report";
import { useMotionPreference } from "./use-motion-preference";

/**
 * Касса приюта: закреплённая сцена, где всё привязано к прокрутке.
 *
 * Механика та же, что у «Кольца спасённых» на главной: секция выше экрана,
 * внутри липкая сцена во весь экран, и каждое движение считается от
 * прогресса прокрутки, поэтому назад всё разматывается тем же маршрутом.
 * Монеты с отпечатком лапы падают в миску, миска наполняется, сумма
 * набегает от нуля, в конце выезжают две строки: остаток и целевые расходы.
 *
 * Монета собрана из CSS и уже готовой маски лапы: отдельного файла ей не
 * нужно. При «меньше движения» сцена не липнет и сразу показывает итог.
 */

/** Узкий экран: сцена не липнет, а проигрывается, пока секция идёт через экран. */
const COMPACT = "(max-width: 860px)";
const subscribeCompact = (onChange: () => void) => {
  const media = window.matchMedia(COMPACT);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const useCompact = () => useSyncExternalStore(subscribeCompact, () => window.matchMedia(COMPACT).matches, () => false);

const rub = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (value: number) => `${rub.format(value)} ₽`;

/** Откуда и когда падает каждая монета: доля ширины миски и окно прокрутки. */
const COINS = Array.from({ length: 12 }, (_, index) => ({
  left: 28 + ((index * 37) % 44),
  tilt: -160 + ((index * 53) % 320),
  start: 0.06 + index * 0.05,
}));

function Coin({ progress, left, tilt, start, drop }: { progress: ReturnType<typeof useScroll>["scrollYProgress"]; left: number; tilt: number; start: number; drop: string }) {
  const end = start + 0.2;
  const y = useTransform(progress, [start, end], [drop, "0vh"]);
  const rotate = useTransform(progress, [start, end], [tilt, 0]);
  // Монета исчезает, коснувшись миски: дальше её несёт уровень наполнения.
  const opacity = useTransform(progress, [start, start + 0.02, end, end + 0.04], [0, 1, 1, 0]);
  return <motion.span className="reports-till-coin" style={{ left: `${left}%`, y, rotate, opacity }} aria-hidden="true" />;
}

export function DonationTill(props: { year?: number; finance?: FinancialSummary }) {
  const still = useMotionPreference();
  const compact = useCompact();
  return <TillScene key={compact ? "compact" : "wide"} compact={compact} still={still} {...props} />;
}

function TillScene({ year, finance, compact, still }: { year?: number; finance?: FinancialSummary; compact: boolean; still: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // На широком экране прогресс идёт по липкой сцене, на узком по проходу
  // секции через экран: от входа снизу до ухода вверх.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: compact ? ["start 85%", "end 15%"] : ["start start", "end end"],
  });

  const income = finance?.income ?? 0;
  const balance = finance?.closingBalance ?? 0;
  const targetExpenses = finance?.targetExpenses ?? 0;
  const share = income > 0 ? balance / income : 0;

  /* Фазы по прокрутке липкой сцены:
     0.06–0.85  монеты падают одна за другой
     0.06–0.12  проявляется сумма, дальше набегает с миской
     0.10–0.82  миска наполняется, сумма набегает
     0.80–0.95  выезжают комиссия и остаток */
  const fill = useTransform(scrollYProgress, [0.1, 0.82], [0, share]);
  const sum = useTransform(scrollYProgress, [0.1, 0.82], [0, income]);
  const sumText = useTransform(sum, (value) => money(value));
  const sumOpacity = useTransform(scrollYProgress, (p) => Math.min(1, Math.max(0, (p - 0.06) / 0.06)));
  const reveal = useTransform(scrollYProgress, (p) => Math.min(1, Math.max(0, (p - 0.8) / 0.15)));
  const factsOpacity = reveal;
  const factsY = useTransform(reveal, (v) => 28 * (1 - v));

  if (!finance || income <= 0) return null;

  const live = mounted && !still;

  return (
    <section className="reports-till" ref={sectionRef} data-still={live ? "false" : "true"} aria-labelledby="till-title">
      <div className="reports-till-sticky">
        <div className="reports-wrap reports-till-stage">
          <div className="reports-till-copy">
            <h2 id="till-title">
              Каждый рубль <span className="reports-mark">на счету</span>
            </h2>
            {/* Про источник денег и комиссию уже сказано в карточках доверия
                выше: здесь только то, что показывает сама сцена. */}
            <p>
              {year ? `По отчёту за ${year} год. ` : ""}Первые три месяца работы: взносы пришли на счёт, а тратить их приют
              ещё не начал.
            </p>

            <motion.p className="reports-till-sum" style={live ? { opacity: sumOpacity } : undefined}>
              <motion.b className="reports-num">{live ? sumText : money(income)}</motion.b>
              <span>поступило от граждан</span>
            </motion.p>

            <motion.ul className="reports-till-facts" style={live ? { opacity: factsOpacity, y: factsY } : undefined}>
              <li>
                <b className="reports-num">{money(balance)}</b>
                <span>осталось на счёте</span>
              </li>
              <li>
                <b className="reports-num">{money(targetExpenses)}</b>
                <span>целевых расходов</span>
              </li>
            </motion.ul>
          </div>

          <div className="reports-till-scene" aria-hidden="true">
            {live ? COINS.map((coin) => <Coin key={coin.start} progress={scrollYProgress} drop={compact ? "-45vh" : "-72vh"} {...coin} />) : null}
            <div className="reports-till-bowl">
              <motion.span
                className="reports-till-fill"
                style={live ? { scaleY: fill } : { scaleY: share }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

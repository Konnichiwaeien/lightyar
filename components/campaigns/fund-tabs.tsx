"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Две вкладки на странице сбора: заголовок секции и есть переключатель.
 *
 * Обычная пара «заголовок плюс вкладки» здесь давала бы повтор: заголовок «О
 * сборе» и первая вкладка «О сборе» стояли бы друг под другом. Поэтому
 * вкладки набраны кеглем заголовка, невыбранная уходит в тихий цвет, а под
 * выбранной едет янтарная черта. Для читалки это обычный tablist с подписью,
 * а сама секция названа скрытым заголовком.
 *
 * Переключение ведёт framer: панель уходит вверх, следующая приходит снизу, и
 * высота секции меняется не скачком, а переездом (`layout`). При «меньше
 * движения» остаётся только проявление.
 *
 * Содержимое панелей приходит готовым с сервера: разметка вкладки, которая
 * сейчас не видна, в документ не попадает вовсе — это осознанный размен,
 * тексту в первой вкладке поисковик рад, вторая ему не нужна.
 */

export interface FundTab {
  key: string;
  label: string;
  panel: ReactNode;
}

export function FundTabs({ label, tabs }: { label: string; tabs: FundTab[] }) {
  const [active, setActive] = useState(0);
  const marks = useRef<(HTMLButtonElement | null)[]>([]);
  const still = useReducedMotion();
  const id = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    marks.current[next]?.focus();
  };

  const current = tabs[active];

  return (
    <div className="fund-switch">
      <div aria-label={label} className="fund-switch__tabs" onKeyDown={onKeyDown} role="tablist">
        {tabs.map((tab, index) => (
          <button
            aria-controls={`${id}-panel-${tab.key}`}
            aria-selected={index === active}
            className="fund-switch__tab"
            id={`${id}-tab-${tab.key}`}
            key={tab.key}
            onClick={() => setActive(index)}
            ref={(node) => {
              marks.current[index] = node;
            }}
            role="tab"
            tabIndex={index === active ? 0 : -1}
            type="button"
          >
            {tab.label}
            {index === active ? (
              <motion.i
                aria-hidden="true"
                className="fund-switch__mark"
                layoutId={`${id}-mark`}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 38 }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <motion.div className="fund-switch__stage" layout={still ? false : "position"}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            animate={still ? { opacity: 1 } : { opacity: 1, y: 0 }}
            aria-labelledby={`${id}-tab-${current.key}`}
            className="fund-switch__panel"
            exit={still ? { opacity: 0 } : { opacity: 0, y: -10 }}
            id={`${id}-panel-${current.key}`}
            initial={still ? { opacity: 0 } : { opacity: 0, y: 14 }}
            key={current.key}
            role="tabpanel"
            tabIndex={0}
            transition={{ duration: still ? 0.15 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {current.panel}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

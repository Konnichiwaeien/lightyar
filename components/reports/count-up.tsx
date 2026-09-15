"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "./use-motion-preference";

type Kind = "int" | "money" | "rub" | "percent";

const rub = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/* Целые рубли для сборов: там суммы круглые, и копейки только шумят. */
const whole = new Intl.NumberFormat("ru-RU");

function render(value: number, kind: Kind): string {
  if (kind === "money") return `${rub.format(value)} ₽`;
  if (kind === "rub") return `${whole.format(Math.round(value))} ₽`;
  if (kind === "percent") return `${value.toFixed(1).replace(".", ",")}%`;
  return String(Math.round(value));
}

/**
 * Один наблюдатель на все счётчики страницы: их несколько десятков,
 * и по наблюдателю на каждый это лишняя работа для браузера.
 */
const watchers = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;

function watch(node: Element, onEnter: () => void): () => void {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          watchers.get(entry.target)?.();
          unwatch(entry.target);
        }
      },
      { threshold: 0.6 },
    );
  }
  watchers.set(node, onEnter);
  observer.observe(node);
  return () => unwatch(node);
}

function unwatch(node: Element) {
  watchers.delete(node);
  observer?.unobserve(node);
}

/**
 * Число набегает от нуля, когда попадает в кадр.
 *
 * На сервере и без JS стоит итог, поэтому разметка не прыгает и число видно
 * всегда. Формат задаётся словом, а не функцией: серверный компонент не может
 * передать функцию клиентскому.
 */
export function CountUp({ value, kind = "int", duration = 1400 }: { value: number; kind?: Kind; duration?: number }) {
  const reduced = useMotionPreference();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (reduced) return;
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const stop = watch(node, () => {
      const start = performance.now();
      const tick = (now: number) => {
        // Метка кадра бывает раньше старта на доли миллисекунды: доля
        // уходила в минус, и на экране мелькало «−1». Разгон быстрый,
        // подход к итогу мягкий, чтобы глаз успел прочитать число.
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(value * eased);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    // Сброс в ноль до того, как число попало в кадр: иначе читатель увидел бы
    // итог, потом ноль и снова разгон.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(0);
    return () => {
      stop();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, reduced]);

  // При «меньше движения» число стоит на месте: состояние не трогаем.
  const display = reduced ? value : shown;

  return (
    <span ref={ref} className="reports-num">
      {render(display, kind)}
    </span>
  );
}

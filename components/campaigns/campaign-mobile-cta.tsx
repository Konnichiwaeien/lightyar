"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";

import { preloadDonatePanel, requestDonationIntent } from "@/lib/donations/donation-intent";

/**
 * Кнопка помощи, которая догоняет читателя на телефоне.
 *
 * Показывается, когда кнопка из обложки ушла с экрана, и прячется, когда та
 * вернулась: раньше здесь висел обработчик прокрутки с порогом в шестьсот
 * пикселей, и на длинной странице кнопка успевала появиться поверх такой же
 * кнопки обложки. Наблюдатель пересечения считает то же самое без работы на
 * каждый кадр прокрутки.
 *
 * Нажатие открывает то же окно помощи, что и кнопки на карточках, с
 * подставленным сбором. Прежняя версия просто прокручивала к форме на
 * странице; формы на странице больше нет, и это к лучшему: она была второй
 * копией той, что в окне.
 */

export function CampaignMobileCta({ anchor, id, title }: { anchor: string; id: string; title: string }) {
  const [shown, setShown] = useState(false);
  const still = useReducedMotion();

  useEffect(() => {
    const target = document.getElementById(anchor);
    if (!target) return;

    /* Условие одно: кнопка обложки ушла вверх за край экрана. Не «не видна»:
       в начале страницы она ещё ниже экрана, и подсказка всплывала бы над
       такой же кнопкой, до которой читатель не успел долистать.

       Считается по прокрутке, а не наблюдателем пересечения: наблюдатель
       сообщает о смене состояния, и прыжок через всю обложку (конец страницы
       по клавише, переход по якорю) он проходит молча — вход и выход
       случаются в одном кадре, состояние «не пересекается» не меняется, и
       кнопка не появляется вовсе. Замер снимается раз в кадр, пока идёт
       прокрутка. */
    /* Пока на экране форма взноса, догонялка прячется: она ведёт к тому же
       действию и вдобавок закрывает собой нижние ступени. Форма появляется и
       исчезает вместе со своей вкладкой, поэтому ищется каждый раз заново. */
    const onScreen = (node: Element | null) => {
      if (!node) return false;
      const box = node.getBoundingClientRect();
      return box.top < window.innerHeight - 80 && box.bottom > 80;
    };

    let frame = 0;
    const measure = () => {
      frame = 0;
      setShown(target.getBoundingClientRect().bottom < 0 && !onScreen(document.querySelector(".fund-form")));
    };
    const queue = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [anchor]);

  return (
    <AnimatePresence>
      {shown ? (
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          className="fund-dock"
          exit={{ y: 90, opacity: 0 }}
          initial={{ y: 90, opacity: 0 }}
          transition={still ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 32 }}
        >
          <button
            className="camp-btn"
            onClick={() => requestDonationIntent({ kind: "campaign", id, title, amount: 500 })}
            onFocus={preloadDonatePanel}
            onMouseEnter={preloadDonatePanel}
            type="button"
          >
            <Heart aria-hidden="true" size={18} />
            Помочь сбору
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

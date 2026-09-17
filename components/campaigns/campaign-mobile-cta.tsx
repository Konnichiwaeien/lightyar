"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CampaignFormLink } from "./campaign-form-link";

/**
 * Кнопка помощи, которая догоняет читателя на телефоне.
 *
 * Видна после кнопки обложки, кроме момента, когда на экране открыта форма.
 * Нажатие открывает вкладку формы и прокручивает к ней.
 */

export function CampaignMobileCta({ anchor }: { anchor: string }) {
  const [shown, setShown] = useState(false);
  const still = useReducedMotion();

  useEffect(() => {
    const target = document.getElementById(anchor);
    if (!target) return;
    const compact = window.matchMedia("(max-width: 860px)");
    const form = document.querySelector(".fund-form");

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
       скрывается вместе со своей вкладкой, оставаясь смонтированной. */
    const onScreen = (node: Element | null) => {
      if (!node || node.closest('[aria-hidden="true"]')) return false;
      const box = node.getBoundingClientRect();
      return box.top < window.innerHeight - 80 && box.bottom > 80;
    };

    let frame = 0;
    const measure = () => {
      frame = 0;
      // CSS hides this control on desktop; skip its layout reads there too.
      setShown(compact.matches && target.getBoundingClientRect().bottom < 0 && !onScreen(form));
    };
    const queue = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    const formPanel = form?.closest('[role="tabpanel"]');
    const visibility = new MutationObserver(queue);
    if (formPanel) visibility.observe(formPanel, { attributes: true, attributeFilter: ["aria-hidden"] });
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    return () => {
      visibility.disconnect();
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
          exit={{ y: still ? 0 : 90, opacity: 0 }}
          initial={{ y: still ? 0 : 90, opacity: 0 }}
          transition={still ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 32 }}
        >
          <CampaignFormLink>Помочь сбору</CampaignFormLink>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

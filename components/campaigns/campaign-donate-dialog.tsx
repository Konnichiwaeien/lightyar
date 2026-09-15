"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import {
  DONATE_OPEN_EVENT,
  DONATION_INTENT_EVENT,
  requestDonationIntent,
  type DonationIntent,
} from "@/lib/donations/donation-intent";
import { useLenis } from "@/components/ui/smooth-scroll";

/**
 * Окно помощи на странице сборов.
 *
 * На широком экране это окно по центру, на узком лист, выезжающий снизу: на
 * телефоне окно по центру оставляет поля по краям и всё равно упирается в
 * клавиатуру, а лист начинается от большого пальца. Точка перелома одна на
 * страницу, 860 пикселей.
 *
 * Внутри своя форма, а не панель с главной. Та вписана в широкую секцию:
 * вкладки, лента помощников, подопечный над верхней кромкой. В окне это
 * лишнее, а подопечный ещё и налезал на заголовок.
 *
 * Открытие и закрытие ведёт framer: окно всплывает и растёт от 96 процентов,
 * лист выезжает снизу, оба уходят обратно тем же путём. AnimatePresence нужен
 * ради выхода: без него узел исчезал бы мгновенно, и закрытие читалось бы
 * обрывом. При «меньше движения» остаётся только проявление.
 *
 * Форма грузится динамически по первому открытию: её код не нужен, пока
 * читатель не решил помочь. Событие с назначением, пришедшее раньше, чем
 * форма успела подписаться, окно запоминает и повторяет, когда форма готова.
 *
 * Закрытие уносит и форму: набранное в полях не сохраняется. Пока оплата не
 * подключена, терять там нечего; когда подключат, значения нужно будет
 * поднять сюда, иначе случайное закрытие будет стоить читателю ввода.
 */

const CampaignDonateForm = dynamic(
  () => import("@/components/campaigns/campaign-donate-form").then((module) => module.CampaignDonateForm),
  {
    ssr: false,
    loading: () => (
      <p className="camp-donate__loading" role="status">
        Открываем форму…
      </p>
    ),
  },
);

/** Узкий экран: там окно превращается в лист снизу. */
function useSheet(query = "(max-width: 860px)") {
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setSheet(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);
  return sheet;
}

export function CampaignDonateDialog() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<DonationIntent | null>(null);
  const readyRef = useRef(false);
  const replayingRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const { getLenis } = useLenis();
  const sheet = useSheet();
  const still = useReducedMotion();

  useEffect(() => {
    const show = () => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
    const receiveIntent = (event: Event) => {
      if (replayingRef.current) return;
      const detail = (event as CustomEvent<DonationIntent>).detail;
      if (!readyRef.current && detail) setPending(detail);
      show();
    };
    window.addEventListener(DONATION_INTENT_EVENT, receiveIntent);
    window.addEventListener(DONATE_OPEN_EVENT, show);
    return () => {
      window.removeEventListener(DONATION_INTENT_EVENT, receiveIntent);
      window.removeEventListener(DONATE_OPEN_EVENT, show);
    };
  }, []);

  const onReady = useCallback(() => {
    readyRef.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !pending) return;
    replayingRef.current = true;
    requestDonationIntent(pending);
    replayingRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(null);
  }, [ready, pending]);

  useEffect(() => {
    if (!open) return;

    /* Страница под окном стоит: и обычная прокрутка, и плавная. */
    const lenis = getLenis();
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const visible = [...focusable].filter((node) => node.offsetParent !== null || node === closeRef.current);
      if (visible.length === 0) return;
      const first = visible[0];
      const last = visible[visible.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      openerRef.current?.focus();
    };
  }, [open, getLenis]);

  /* Лист выезжает снизу, окно всплывает и растёт. При «меньше движения»
     остаётся проявление: пружина и выезд сняты. */
  const panelMotion = still
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : sheet
      ? {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" },
          transition: { type: "spring" as const, stiffness: 320, damping: 34, mass: 0.9 },
        }
      : {
          initial: { opacity: 0, scale: 0.96, y: 18 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.97, y: 10 },
          transition: { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 },
        };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="camp-donate"
          data-sheet={sheet ? "true" : undefined}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            aria-labelledby="camp-donate-title"
            aria-modal="true"
            className="camp-donate__panel"
            ref={panelRef}
            role="dialog"
            {...panelMotion}
          >
            {/* Ручка листа: на телефоне она говорит, что это выдвижной лист,
                и её видно раньше, чем читатель тронет экран. */}
            <span aria-hidden="true" className="camp-donate__grip" />

            <header className="camp-donate__head">
              <h2 id="camp-donate-title">Помочь приюту</h2>
              <button
                aria-label="Закрыть"
                className="camp-donate__close"
                onClick={() => setOpen(false)}
                ref={closeRef}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </header>

            <div className="camp-donate__body">
              <CampaignDonateForm onClose={() => setOpen(false)} onReady={onReady} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

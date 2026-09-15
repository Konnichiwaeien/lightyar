"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";

import type { DonationFeedState } from "@/lib/donations/donation-feed-state";
import {
  DONATE_OPEN_EVENT,
  DONATION_INTENT_EVENT,
  requestDonationIntent,
  type DonationIntent,
} from "@/lib/donations/donation-intent";
import { useLenis } from "@/components/ui/smooth-scroll";

/**
 * Панель помощи в диалоге поверх страницы сборов.
 *
 * Панель та же, что на главной: назначение взноса, ступени, поля, лента
 * помощников. На главной она стоит секцией, и кнопки «Помочь» на карточках
 * сборов прокручивают к ней. Здесь секции нет, и до этого кнопки на
 * карточках отправляли событие в пустоту: панель не была смонтирована, и
 * нажатие ничего не делало.
 *
 * Панель грузится динамически по первому открытию и дальше остаётся
 * смонтированной, диалог только прячет её: так не теряется набранное в
 * полях. Событие с назначением, которое пришло раньше, чем панель успела
 * подписаться, диалог запоминает и повторяет, когда панель готова.
 *
 * Открывается на событие назначения (карточка сбора) и на событие открытия
 * без назначения (финальный призыв). Закрывается крестиком, клавишей
 * Escape и щелчком по затемнению; фокус ходит по кругу внутри и после
 * закрытия возвращается на кнопку, с которой пришли.
 */

const CampaignDonatePanel = dynamic(
  () => import("@/components/campaigns/campaign-donate-panel").then((module) => module.CampaignDonatePanel),
  {
    ssr: false,
    loading: () => (
      <p className="camp-donate__loading" role="status">
        Открываем панель помощи…
      </p>
    ),
  },
);

export function CampaignDonateDialog({ feed }: { feed: DonationFeedState }) {
  const [open, setOpen] = useState(false);
  /* Панель монтируется по первому открытию и больше не размонтируется. */
  const [opened, setOpened] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<DonationIntent | null>(null);
  const readyRef = useRef(false);
  const replayingRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const { getLenis } = useLenis();

  useEffect(() => {
    const show = () => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
      setOpened(true);
    };
    const receiveIntent = (event: Event) => {
      // Повтор события для панели: диалог его уже видел.
      if (replayingRef.current) return;
      const detail = (event as CustomEvent<DonationIntent>).detail;
      // Панель ещё не подписана: запомнить и повторить, когда будет.
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

    /* Страница под диалогом стоит: и обычная прокрутка, и плавная. */
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

  return (
    <div
      className="camp-donate"
      hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        aria-labelledby="camp-donate-title"
        aria-modal="true"
        className="camp-donate__panel"
        ref={panelRef}
        role="dialog"
      >
        <div className="camp-donate__head">
          <h2 id="camp-donate-title">Помочь приюту</h2>
          <button
            aria-label="Закрыть"
            className="camp-donate__close"
            onClick={() => setOpen(false)}
            ref={closeRef}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        {opened ? <CampaignDonatePanel feed={feed} onReady={onReady} /> : null}
      </div>
    </div>
  );
}

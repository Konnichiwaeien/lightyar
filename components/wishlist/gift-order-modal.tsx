"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Copy, Check, ArrowUpRight, X, Loader2, PawPrint } from "lucide-react";
import type { WishlistItem, WishlistSettings } from "@/lib/api/services/wishlist";

type Stage = "form" | "sent";

const EASE = [0.33, 1, 0.68, 1] as const;

/**
 * Заказ подарка.
 *
 * На десктопе это диалог по центру, на мобильном — шторка снизу: там окно
 * во весь экран мешает вернуться к списку, а шторка читается как продолжение
 * страницы. Форма и логика общие, различается только подача.
 */
export function GiftOrderModal({
  item,
  settings,
  open,
  onClose,
}: {
  item: WishlistItem | null;
  settings: WishlistSettings;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDrawer, setIsDrawer] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // режим пересчитывается и по событию, и при каждом открытии: полагаться только
  // на change нельзя — в фоновой вкладке событие может не долететь
  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const sync = () => setIsDrawer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [open]);

  // при каждом открытии начинаем с чистой формы, иначе видно хвост прошлого заказа
  useEffect(() => {
    if (open) {
      setStage("form");
      setError(null);
      setFileName(null);
    }
  }, [open, item?.documentId]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const elements = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea, select') || []).filter(el => el.getClientRects().length);
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      previous?.focus();
    };
  }, [open, onClose]);

  const copyAddress = async () => {
    if (!settings.pickupAddress) return;
    try {
      await navigator.clipboard.writeText(settings.pickupAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Браузер не дал скопировать адрес — выделите его вручную.");
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending || !item) return;
    setSending(true);
    setError(null);

    const body = new FormData(event.currentTarget);
    body.set("wishlistItemId", item.documentId);
    body.set("consent", body.get("consent") === "on" ? "true" : "false");

    try {
      const response = await fetch("/api/gift-orders", { method: "POST", body });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Заявка не отправилась. Попробуйте ещё раз.");
        return;
      }
      setStage("sent");
    } catch {
      setError("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  };

  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isDrawer
      ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
      : { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.98 } };

  const modal = (
    <AnimatePresence>
      {open && item ? (
        <motion.div
          className="gift-scrim"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.35, ease: "easeInOut" }}
          onClick={(event) => event.target === event.currentTarget && onClose()}
        >
          {/*
            Вход и перетаскивание разнесены по двум элементам: если повесить их на
            один, drag перехватывает ось Y и анимация появления застревает на старте.
          */}
          <motion.div
            className={`gift-shell${isDrawer ? " gift-shell--drawer" : ""}`}
            {...panelMotion}
            transition={{ duration: reduced ? 0.01 : 0.55, ease: EASE }}
          >
            <motion.div
              className={`gift-panel${isDrawer ? " gift-panel--drawer" : ""}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              ref={panelRef}
              drag={isDrawer && !reduced ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 600) onClose();
              }}
            >
              {isDrawer ? <span className="gift-grabber" aria-hidden="true" /> : null}

            <header className="gift-head">
              <h2 id={titleId}>{stage === "form" ? "Заказать подарок" : "Спасибо!"}</h2>
              <button type="button" onClick={onClose} aria-label="Закрыть">
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="gift-body" data-lenis-prevent>
              {stage === "sent" ? (
                <div className="gift-done">
                  <span className="gift-done__mark" aria-hidden="true">
                    <PawPrint size={30} />
                  </span>
                  <p>
                    Заявка на «{item.title}» сохранена. Если понадобится уточнить детали, волонтёры свяжутся с вами.
                  </p>
                  <button type="button" className="gift-submit" onClick={onClose}>
                    Закрыть
                  </button>
                </div>
              ) : !settings.acceptingOrders ? (
                <div className="gift-done">
                  <p>Перед заказом уточните у нас адрес и способ доставки. Поможем выбрать нужный подарок и договоримся, как его передать.</p>
                  <a className="gift-submit" href={settings.contactUrl || "https://vk.com/im?sel=-228082117"} target="_blank" rel="noopener noreferrer">Связаться с приютом <ArrowUpRight size={17} aria-hidden="true" /></a>
                </div>
              ) : (
                <>
                  <p className="gift-lead">
                    Закажите <b>{item.title}</b> на {settings.marketplaceName} самостоятельно и укажите наш пункт
                    выдачи в адресе доставки.
                  </p>

                  {settings.instructions ? <p className="gift-lead gift-lead--quiet">{settings.instructions}</p> : null}

                  {settings.pickupAddress ? (
                    <div className="gift-address">
                      <p className="gift-address__label">Адрес доставки</p>
                      <p className="gift-address__value">{settings.pickupAddress}</p>
                      <button type="button" className="gift-copy" onClick={copyAddress}>
                        {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                        {copied ? "Скопирован" : "Скопировать адрес"}
                      </button>
                      <p className="gift-note">Без этого адреса посылка до нас не доедет</p>
                    </div>
                  ) : null}

                  {item.marketplaceUrl || settings.marketplaceUrl ? (
                    <a
                      className="gift-external"
                      href={item.marketplaceUrl || settings.marketplaceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Перейти и сделать заказ
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </a>
                  ) : null}

                  <div className="gift-divider" role="presentation" />

                  <h3 className="gift-subhead">Когда заказ будет оформлен</h3>
                  <p className="gift-lead gift-lead--quiet">
                    Пришлите штрих-код заказа — по нему волонтёры получат посылку в пункте выдачи.
                  </p>

                  <form onSubmit={submit} className="gift-form">
                    <label htmlFor="gift-donor-name">
                      <span className="gift-label">
                        Имя дарителя <i aria-hidden="true">*</i>
                      </span>
                      <input id="gift-donor-name" name="donorName" required minLength={2} maxLength={100} placeholder="Как к вам обращаться" autoComplete="name" />
                    </label>

                    <label htmlFor="gift-phone">
                      <span className="gift-label">
                        Телефон <i aria-hidden="true">*</i>
                      </span>
                      <input id="gift-phone" name="phone" required maxLength={32} placeholder="+7 (999) 999-99-99" inputMode="tel" autoComplete="tel" />
                    </label>

                    <label htmlFor="gift-email">
                      <span className="gift-label">E-mail</span>
                      <input id="gift-email" name="email" type="email" placeholder="Чтобы прислать благодарность" autoComplete="email" />
                    </label>

                    <label className="gift-file" htmlFor="gift-barcode">
                      <span className="gift-label">
                        Штрих-код заказа <i aria-hidden="true">*</i>
                      </span>
                      <input
                        id="gift-barcode"
                        name="barcode"
                        type="file"
                        required
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(event) => setFileName(event.target.files?.[0]?.name || null)}
                      />
                      <span className="gift-hint">{fileName || "Фотография или PDF, до 8 МБ"}</span>
                    </label>

                    {/* ловушка для ботов: людям поле не показывается и в таб-порядок не попадает */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />

              <label className="gift-consent" htmlFor="gift-consent">
                      <input id="gift-consent" type="checkbox" name="consent" required />
                      <span>
                        Соглашаюсь на обработку персональных данных согласно{" "}
                        <Link href="/privacy" onClick={(event) => event.stopPropagation()}>
                          политике конфиденциальности
                        </Link>
                      </span>
                    </label>

                    <AnimatePresence>
                      {error ? (
                        <motion.p
                          className="gift-error"
                          role="alert"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reduced ? 0.01 : 0.3, ease: EASE }}
                        >
                          {error}
                        </motion.p>
                      ) : null}
                    </AnimatePresence>

                    <button type="submit" className="gift-submit" disabled={sending}>
                      {sending ? <Loader2 size={17} className="gift-spin" aria-hidden="true" /> : null}
                      {sending ? "Отправляем…" : "Отправить заявку"}
                    </button>
                  </form>
                </>
              )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return isMounted ? createPortal(modal, document.body) : null;
}

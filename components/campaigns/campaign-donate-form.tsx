"use client";

import { useEffect, useMemo, useState } from "react";
import { Target, X } from "lucide-react";

import { DONATION_TIERS } from "@/lib/donations/donation-tiers";
import { getDonationTier } from "@/lib/donations/get-donation-tier";
import { DONATION_INTENT_EVENT, type DonationIntent } from "@/lib/donations/donation-intent";
import { DonationFields } from "@/components/donations/donation-fields";
import { DonationTierPicker } from "@/components/donations/donation-tier-picker";
/* Стили ступеней и полей лежат рядом с панелью главной и подключались её
   файлом. Панель здесь не рендерится, поэтому лист стилей подключается
   напрямую: без него поля приходят голой разметкой. */
import "@/components/donations/donation-experience.css";

/**
 * Форма взноса для окна помощи на странице сборов.
 *
 * Ступени и поля здесь те же самые, что на главной: `DonationTierPicker` и
 * `DonationFields` берутся как есть. Своя копия была бы вторым местом, где
 * живут суммы, подписи и правила ввода, и они разошлись бы на первой же
 * правке.
 *
 * Не берётся только обвязка: вкладки «Помочь» и «Помощники», лента
 * помощников и подопечный, висящий над верхней кромкой панели. Всё это
 * устроено под широкую секцию, а в окне читалось мусором, и подопечный ещё
 * налезал на заголовок.
 *
 * Оплата пока не подключена: об этом говорит сама кнопка платежа внутри
 * полей, она выключена и подписана.
 */

export function CampaignDonateForm({ onClose, onReady }: { onClose: () => void; onReady: () => void }) {
  const [intent, setIntent] = useState<DonationIntent | null>(null);
  const [cadence, setCadence] = useState<"monthly" | "once">("once");
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [consent, setConsent] = useState(false);
  const selectedTier = useMemo(() => getDonationTier(amount), [amount]);

  /* Назначение приходит событием: кнопка «Помочь» на карточке сбора шлёт
     сбор и сумму, кнопки «Сделать взнос» и «Помочь без цели» не шлют ничего. */
  useEffect(() => {
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<DonationIntent>).detail;
      if (!detail || !Number.isFinite(detail.amount) || detail.amount <= 0) return;
      setIntent(detail);
      setCadence("once");
      setAmount(detail.amount);
      setCustomAmount(DONATION_TIERS.some((tier) => tier.amount === detail.amount) ? "" : String(detail.amount));
    };
    window.addEventListener(DONATION_INTENT_EVENT, receive);
    /* Окно ждёт этого сигнала: событие с назначением могло прийти раньше, чем
       форма догрузилась, и тогда окно повторяет его сюда. */
    onReady();
    return () => window.removeEventListener(DONATION_INTENT_EVENT, receive);
  }, [onReady]);

  const chooseTier = (next: number) => {
    setAmount(next);
    setCustomAmount("");
  };

  const changeCustomAmount = (value: string) => {
    setCustomAmount(value);
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) setAmount(parsed);
  };

  const changeAnonymous = (next: boolean) => {
    setAnonymous(next);
    if (next) setConsent(false);
  };

  return (
    <form className="camp-form" onSubmit={(event) => event.preventDefault()}>
      {intent ? (
        <p className="camp-form__intent">
          <Target aria-hidden="true" size={17} />
          <span>
            <small>Взнос в сбор</small>
            <strong>{intent.title}</strong>
          </span>
          <button aria-label="Убрать назначение взноса" onClick={() => setIntent(null)} type="button">
            <X aria-hidden="true" size={15} />
          </button>
        </p>
      ) : (
        <p className="camp-form__intent camp-form__intent--free">
          <Target aria-hidden="true" size={17} />
          <span>
            <small>Взнос без цели</small>
            <strong>Приют направит туда, где нужнее</strong>
          </span>
        </p>
      )}

      <DonationTierPicker
        customAmount={customAmount}
        onCustomAmountChange={changeCustomAmount}
        onSelect={chooseTier}
        selected={selectedTier}
      />

      <DonationFields
        amount={amount}
        anonymous={anonymous}
        cadence={cadence}
        consent={consent}
        donorName={donorName}
        email={email}
        onAnonymousChange={changeAnonymous}
        onCadenceChange={setCadence}
        onConsentChange={setConsent}
        onDonorNameChange={setDonorName}
        onEmailChange={setEmail}
      />

      {/* Про то, что оплата не подключена, говорит сама кнопка платежа внутри
          полей; здесь только выход. */}
      <p className="camp-form__note">
        Перевести можно по реквизитам из подвала сайта.{" "}
        <button onClick={onClose} type="button">
          Закрыть окно
        </button>
      </p>
    </form>
  );
}

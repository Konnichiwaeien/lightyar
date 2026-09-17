"use client";

import { useEffect, useMemo, useState } from "react";
import { PawPrint, Target, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { DONATION_TIERS } from "@/lib/donations/donation-tiers";
import { getDonationTier } from "@/lib/donations/get-donation-tier";
import { donationErrors, type DonationValidationField } from "@/lib/donations/donation-schema";
import { DONATION_INTENT_EVENT, DONATION_INTENT_LABELS, type DonationIntent } from "@/lib/donations/donation-intent";
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

/* Форма живёт в двух местах: в окне помощи и прямо на странице сбора,
   вкладкой рядом с ленты помощников. В окне у неё есть выход и сигнал
   готовности, на странице ни того, ни другого не нужно, зато назначение
   известно заранее — это тот сбор, который читатель и открыл. */
export function CampaignDonateForm({
  initial = null,
  onClose,
  onReady,
  listenForIntent = true,
  lockIntent = false,
}: {
  initial?: DonationIntent | null;
  onClose?: () => void;
  onReady?: () => void;
  listenForIntent?: boolean;
  lockIntent?: boolean;
}) {
  const [intent, setIntent] = useState<DonationIntent | null>(initial);
  const still = useReducedMotion();
  const [cadence, setCadence] = useState<"monthly" | "once">("once");
  const [amount, setAmount] = useState(initial?.amount || 500);
  const [customAmount, setCustomAmount] = useState("");
  const [customActive, setCustomActive] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<DonationValidationField, boolean>>>({});
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [consent, setConsent] = useState(false);
  const selectedTier = useMemo(() => getDonationTier(amount), [amount]);
  const errors = donationErrors({ amount: customActive ? customAmount : amount, cadence, donorName, email, anonymous, consent });
  const visibleErrors = Object.fromEntries(Object.entries(errors).filter(([field]) => touched[field as DonationValidationField]));

  /* Назначение приходит событием: кнопка «Помочь» на карточке сбора шлёт
     сбор и сумму, кнопки «Сделать взнос» и «Помочь без цели» не шлют ничего. */
  useEffect(() => {
    if (!listenForIntent || lockIntent) return;
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<DonationIntent>).detail;
      if (!detail || !Number.isFinite(detail.amount) || detail.amount <= 0) return;
      setIntent(detail);
      setCadence("once");
      setAmount(detail.amount);
      setCustomActive(!DONATION_TIERS.some((tier) => tier.amount === detail.amount));
      setTouched({});
      setCustomAmount(DONATION_TIERS.some((tier) => tier.amount === detail.amount) ? "" : String(detail.amount));
    };
    window.addEventListener(DONATION_INTENT_EVENT, receive);
    /* Окно ждёт этого сигнала: событие с назначением могло прийти раньше, чем
       форма догрузилась, и тогда окно повторяет его сюда. */
    onReady?.();
    return () => window.removeEventListener(DONATION_INTENT_EVENT, receive);
  }, [listenForIntent, lockIntent, onReady]);

  const chooseTier = (next: number) => {
    setAmount(next);
    setCustomAmount("");
    setCustomActive(false);
  };

  const changeCustomAmount = (value: string) => {
    setCustomAmount(value);
    setCustomActive(true);
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) setAmount(parsed);
  };

  const changeAnonymous = (next: boolean) => {
    setAnonymous(next);
    if (next) setConsent(false);
  };

  return (
    <form className="camp-form" aria-label={intent ? `${DONATION_INTENT_LABELS[intent.kind]}: ${intent.title}` : 'Пожертвование приюту'} noValidate onBlurCapture={(event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      const field = input.name === "customAmount" ? "amount" : input.name;
      if (field === "amount" || field === "donorName" || field === "email" || field === "consent") {
        setTouched(previous => ({ ...previous, [field]: true }));
      }
    }} onSubmit={(event) => {
      event.preventDefault();
      setTouched({ amount: true, donorName: true, email: true, consent: true });
      const first = Object.keys(errors)[0];
      if (first) event.currentTarget.querySelector<HTMLInputElement>(`[name="${first === "amount" ? "customAmount" : first}"]`)?.focus();
    }}>
      {intent && <><input type="hidden" name="donationTargetKind" value={intent.kind} /><input type="hidden" name="donationTargetId" value={intent.id} /><input type="hidden" name="donationTargetTitle" value={intent.title} /></>}
      {intent ? (
        <motion.p className="camp-form__intent" key={intent.id} initial={false}
          whileHover={still ? undefined : { y: -2 }} transition={{ duration: .2 }}>
          <span className="camp-form__intent-icon">{intent.kind === 'pet' ? <PawPrint aria-hidden="true" size={22} /> : <Target aria-hidden="true" size={22} />}</span>
          <span>
            <small>{DONATION_INTENT_LABELS[intent.kind]}</small>
            <strong>{intent.title}</strong>
          </span>
          {!lockIntent && <button aria-label="Убрать назначение взноса" onClick={() => setIntent(null)} type="button">
            <X aria-hidden="true" size={15} />
          </button>}
        </motion.p>
      ) : (
        <p className="camp-form__intent camp-form__intent--free">
          <span className="camp-form__intent-icon"><Target aria-hidden="true" size={22} /></span>
          <span>
            <small>Взнос без цели</small>
            <strong>Приют направит туда, где нужнее</strong>
          </span>
        </p>
      )}

      <DonationTierPicker
        compact
        customAmount={customAmount}
        customActive={customActive}
        amountError={visibleErrors.amount}
        onCustomAmountChange={changeCustomAmount}
        onSelect={chooseTier}
        selected={selectedTier}
      />

      <DonationFields
        animateTransitions={intent?.kind === 'pet'}
        showStatusNote={false}
        errors={visibleErrors}
        amountValid={!errors.amount}
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
          полей; здесь только выход, и он нужен лишь в окне. */}
      {onClose && <p className="camp-form__note">
          <button onClick={onClose} type="button">
            Закрыть окно
          </button>
      </p>}
    </form>
  );
}

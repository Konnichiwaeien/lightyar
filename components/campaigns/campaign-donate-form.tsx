"use client";

import { useEffect, useId, useState } from "react";
import { ArrowUpRight, CalendarHeart, HandCoins, Mail, Target, UserRound, X } from "lucide-react";

import { DONATION_TIERS } from "@/lib/donations/donation-tiers";
import { DONATION_INTENT_EVENT, type DonationIntent } from "@/lib/donations/donation-intent";

/**
 * Форма взноса для окна помощи на странице сборов.
 *
 * Своя, а не та, что стоит секцией на главной. Туда форма вписана в широкую
 * панель: вкладки, лента помощников, подопечный, который висит над верхней
 * кромкой. В окне всё это лишнее, а подопечный ещё и налезал на заголовок.
 * Здесь остались только поля: назначение, сумма, как часто, кто платит.
 *
 * Логика общая с главной: те же ступени взноса, те же поля, тот же шаг в
 * пятьсот рублей. Разная только раскладка.
 *
 * Оплата пока не подключена, и форма об этом говорит прямо, а не притворяется
 * рабочей: кнопка платежа выключена и подписана.
 */

const RUB = new Intl.NumberFormat("ru-RU");

export function CampaignDonateForm({ onClose, onReady }: { onClose: () => void; onReady: () => void }) {
  const id = useId();
  const [intent, setIntent] = useState<DonationIntent | null>(null);
  const [cadence, setCadence] = useState<"monthly" | "once">("once");
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [consent, setConsent] = useState(false);

  /* Назначение приходит событием: кнопка «Помочь» на карточке сбора шлёт
     сбор и сумму, кнопка «Сделать взнос» в финале не шлёт ничего. */
  useEffect(() => {
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<DonationIntent>).detail;
      if (!detail || !Number.isFinite(detail.amount) || detail.amount <= 0) return;
      setIntent(detail);
      setCadence("once");
      setAmount(detail.amount);
      setCustom(DONATION_TIERS.some((tier) => tier.amount === detail.amount) ? "" : String(detail.amount));
    };
    window.addEventListener(DONATION_INTENT_EVENT, receive);
    /* Окно ждёт этого сигнала: событие с назначением могло прийти раньше, чем
       форма догрузилась, и тогда окно повторяет его сюда. */
    onReady();
    return () => window.removeEventListener(DONATION_INTENT_EVENT, receive);
  }, [onReady]);

  const pickTier = (value: number) => {
    setAmount(value);
    setCustom("");
  };

  const changeCustom = (value: string) => {
    setCustom(value);
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) setAmount(parsed);
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

      <fieldset className="camp-form__block">
        <legend>Сколько</legend>
        <div className="camp-form__tiers">
          {DONATION_TIERS.map((tier) => (
            <button
              key={tier.id}
              aria-pressed={!custom && amount === tier.amount}
              className="camp-form__tier"
              onClick={() => pickTier(tier.amount)}
              type="button"
            >
              <b>{RUB.format(tier.amount)} ₽</b>
              <small>{tier.shortLabel}</small>
            </button>
          ))}
        </div>
        <label className="camp-form__field camp-form__field--amount" htmlFor={`${id}-amount`}>
          <span>Своя сумма</span>
          <input
            id={`${id}-amount`}
            inputMode="numeric"
            min={1}
            name="amount"
            onChange={(event) => changeCustom(event.target.value)}
            placeholder="например, 750"
            type="number"
            value={custom}
          />
        </label>
      </fieldset>

      <fieldset className="camp-form__block">
        <legend>Как часто</legend>
        <div className="camp-form__cadence">
          {[
            { key: "once", label: "Разово", note: "один взнос", Icon: HandCoins },
            { key: "monthly", label: "Каждый месяц", note: "опека", Icon: CalendarHeart },
          ].map(({ key, label, note, Icon }) => (
            <label data-selected={cadence === key} key={key}>
              <input
                checked={cadence === key}
                name={`${id}-cadence`}
                onChange={() => setCadence(key as "monthly" | "once")}
                type="radio"
                value={key}
              />
              <Icon aria-hidden="true" size={18} />
              <span>
                <b>{label}</b>
                <small>{note}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="camp-form__toggle">
        <input checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} type="checkbox" />
        <i aria-hidden="true" />
        <span>
          <b>Анонимно</b>
          <small>без имени и почты</small>
        </span>
      </label>

      {anonymous ? null : (
        <div className="camp-form__person">
          <label className="camp-form__field" htmlFor={`${id}-name`}>
            <span>
              <UserRound aria-hidden="true" size={15} /> Имя
            </span>
            <input
              autoComplete="name"
              id={`${id}-name`}
              name="donorName"
              onChange={(event) => setName(event.target.value)}
              placeholder="Как к вам обращаться"
              type="text"
              value={name}
            />
          </label>
          <label className="camp-form__field" htmlFor={`${id}-email`}>
            <span>
              <Mail aria-hidden="true" size={15} /> Почта для чека
            </span>
            <input
              autoComplete="email"
              id={`${id}-email`}
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="mail@example.ru"
              type="email"
              value={email}
            />
          </label>
          <label className="camp-form__consent">
            <input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />
            <span aria-hidden="true" />
            <small>
              Согласен с <a href="/privacy">обработкой персональных данных</a>
            </small>
          </label>
        </div>
      )}

      <button aria-disabled="true" className="camp-form__pay" disabled type="button">
        <span>
          <b>Перевести {RUB.format(amount)} ₽</b>
          <small>онлайн-оплата подключается</small>
        </span>
        <ArrowUpRight aria-hidden="true" size={18} />
      </button>

      <p className="camp-form__note">
        Оплата пока не подключена: перевести можно по реквизитам из подвала.{" "}
        <button onClick={onClose} type="button">
          Закрыть
        </button>
      </p>
    </form>
  );
}

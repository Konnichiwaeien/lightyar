import { ArrowUpRight, CalendarHeart, HandCoins, HeartHandshake, Mail, UserRound } from "lucide-react";
import { useId } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import type { DonationValidationErrors } from "@/lib/donations/donation-schema";

interface DonationFieldsProps {
  animateTransitions?: boolean;
  showStatusNote?: boolean;
  errors?: DonationValidationErrors;
  amountValid?: boolean;
  amount: number;
  cadence: "monthly" | "once";
  donorName: string;
  email: string;
  anonymous: boolean;
  consent: boolean;
  onCadenceChange: (cadence: "monthly" | "once") => void;
  onDonorNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onAnonymousChange: (anonymous: boolean) => void;
  onConsentChange: (consent: boolean) => void;
}

export function DonationFields({
  animateTransitions = false,
  showStatusNote = true,
  errors = {},
  amountValid = true,
  amount,
  cadence,
  donorName,
  email,
  anonymous,
  consent,
  onCadenceChange,
  onDonorNameChange,
  onEmailChange,
  onAnonymousChange,
  onConsentChange,
}: DonationFieldsProps) {
  const inputId = useId();
  const still = usePrefersReducedMotion();
  const duration = animateTransitions && !still ? .28 : 0;
  return (
    <div className="donation-fields" data-animated={animateTransitions}>
      <fieldset className="donation-cadence">
        <legend>Как помогать</legend>
        <div className="donation-cadence__options">
          <label data-cadence="monthly" data-selected={cadence === "monthly"}>
            {animateTransitions && cadence === 'monthly' && <motion.span aria-hidden="true" className="donation-cadence__selection" layoutId={`${inputId}-cadence`} transition={{ duration, ease: [.22, 1, .36, 1] }} />}
            <input
              type="radio"
              name="donation-cadence"
              value="monthly"
              checked={cadence === "monthly"}
              onChange={() => onCadenceChange("monthly")}
            />
            <span className="donation-cadence__icon" aria-hidden="true">
              <CalendarHeart size={19} />
            </span>
            <span className="donation-cadence__copy">
              <strong>Опека</strong>
              <small>каждый месяц</small>
            </span>
          </label>
          <label data-cadence="once" data-selected={cadence === "once"}>
            {animateTransitions && cadence === 'once' && <motion.span aria-hidden="true" className="donation-cadence__selection" layoutId={`${inputId}-cadence`} transition={{ duration, ease: [.22, 1, .36, 1] }} />}
            <input
              type="radio"
              name="donation-cadence"
              value="once"
              checked={cadence === "once"}
              onChange={() => onCadenceChange("once")}
            />
            <span className="donation-cadence__icon" aria-hidden="true">
              <HandCoins size={19} />
            </span>
            <span className="donation-cadence__copy">
              <strong>Разовая помощь</strong>
            </span>
          </label>
        </div>
      </fieldset>

      <label className="donation-anonymous-toggle">
        <input
          type="checkbox"
          name="anonymous"
          checked={anonymous}
          onChange={(event) => onAnonymousChange(event.target.checked)}
        />
        <span className="donation-anonymous-toggle__track" aria-hidden="true"><i /></span>
        <span className="donation-anonymous-toggle__copy">
          <strong>Анонимная помощь</strong>
          <small>Не указывать имя и почту</small>
        </span>
      </label>

      <AnimatePresence initial={false}>
      {!anonymous && (
        <motion.div className="donation-identity-fields" key="identity" initial={{ height: 0, opacity: 0, marginBottom: animateTransitions ? -18 : 0 }} animate={{ height: 'auto', opacity: 1, marginBottom: 0 }} exit={{ height: 0, opacity: 0, marginBottom: animateTransitions ? -18 : 0 }} transition={{ duration, ease: [.22, 1, .36, 1] }} style={{ overflow: 'clip', overflowClipMargin: '6px' }}>
          <div className="donation-fields__person">
            <label className="donation-field" htmlFor={`${inputId}-name`}>
              <span><UserRound size={16} aria-hidden="true" /> Имя</span>
              <input
                id={`${inputId}-name`}
                name="donorName"
                type="text"
                autoComplete="name"
                placeholder="Как к вам обращаться"
                value={donorName}
                aria-invalid={Boolean(errors.donorName)}
                aria-describedby={errors.donorName ? `${inputId}-name-error` : undefined}
                onChange={(event) => onDonorNameChange(event.target.value)}
              />
              {errors.donorName && <small className="donation-field-error" id={`${inputId}-name-error`} role="status">{errors.donorName}</small>}
            </label>
            <label className="donation-field" htmlFor={`${inputId}-email`}>
              <span><Mail size={16} aria-hidden="true" /> Почта для чека</span>
              <input
                id={`${inputId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="mail@example.ru"
                value={email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${inputId}-email-error` : undefined}
                onChange={(event) => onEmailChange(event.target.value)}
              />
              {errors.email && <small className="donation-field-error" id={`${inputId}-email-error`} role="status">{errors.email}</small>}
            </label>
          </div>

          <label className="donation-check donation-check--consent">
            <input
              type="checkbox"
              name="consent"
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? `${inputId}-consent-error` : undefined}
              checked={consent}
              onChange={(event) => onConsentChange(event.target.checked)}
            />
            <span aria-hidden="true" />
            <small>Согласен с <a href="/privacy">обработкой персональных данных</a></small>
          </label>
          {errors.consent && <p className="donation-field-error" id={`${inputId}-consent-error`} role="status">{errors.consent}</p>}
        </motion.div>
      )}
      </AnimatePresence>

      <button className="donation-provider-button" type="button" disabled aria-disabled="true">
        <span className="donation-provider-button__icon" aria-hidden="true">
          <HeartHandshake size={21} />
        </span>
        <span className="donation-provider-button__copy">
          <motion.strong key={amountValid ? amount : 'invalid'} initial={animateTransitions && !still ? { opacity: .5, y: 3 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration ? .16 : 0 }}>{amountValid ? <>Перевести {amount.toLocaleString("ru-RU")} ₽</> : "Укажите сумму"}</motion.strong>
          <small>Онлайн-оплата подключается</small>
        </span>
        <ArrowUpRight className="donation-provider-button__arrow" size={19} aria-hidden="true" />
      </button>
      {showStatusNote && <p className="donation-provider-note">
        Онлайн-оплата пока не подключена. Выбор остаётся только на этой странице.
      </p>}
    </div>
  );
}

import { ArrowUpRight, CalendarHeart, HandCoins, HeartHandshake, Mail, UserRound } from "lucide-react";

interface DonationFieldsProps {
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
  return (
    <div className="donation-fields">
      <fieldset className="donation-cadence">
        <legend>Как помогать</legend>
        <div className="donation-cadence__options">
          <label data-cadence="monthly" data-selected={cadence === "monthly"}>
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

      {!anonymous && (
        <div className="donation-identity-fields">
          <div className="donation-fields__person">
            <label className="donation-field" htmlFor="donation-name">
              <span><UserRound size={16} aria-hidden="true" /> Имя</span>
              <input
                id="donation-name"
                name="donorName"
                type="text"
                autoComplete="name"
                placeholder="Как к вам обращаться"
                value={donorName}
                onChange={(event) => onDonorNameChange(event.target.value)}
              />
            </label>
            <label className="donation-field" htmlFor="donation-email">
              <span><Mail size={16} aria-hidden="true" /> Почта для чека</span>
              <input
                id="donation-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="mail@example.ru"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
              />
            </label>
          </div>

          <label className="donation-check donation-check--consent">
            <input
              type="checkbox"
              name="consent"
              checked={consent}
              onChange={(event) => onConsentChange(event.target.checked)}
            />
            <span aria-hidden="true" />
            <small>Согласен с <a href="/privacy">обработкой персональных данных</a></small>
          </label>
        </div>
      )}

      <button className="donation-provider-button" type="button" disabled aria-disabled="true">
        <span className="donation-provider-button__icon" aria-hidden="true">
          <HeartHandshake size={21} />
        </span>
        <span className="donation-provider-button__copy">
          <strong>Перевести {amount.toLocaleString("ru-RU")} ₽</strong>
          <small>Онлайн-оплата подключается</small>
        </span>
        <ArrowUpRight className="donation-provider-button__arrow" size={19} aria-hidden="true" />
      </button>
      <p className="donation-provider-note">
        Онлайн-оплата пока не подключена. Выбор остаётся только на этой странице.
      </p>
    </div>
  );
}

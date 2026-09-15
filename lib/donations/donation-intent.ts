export const DONATION_INTENT_EVENT = "lightyar:donation-intent";

export interface DonationIntent {
  kind: "gift" | "campaign";
  id: string;
  title: string;
  amount: number;
}

export function requestDonationIntent(detail: DonationIntent) {
  window.dispatchEvent(new CustomEvent<DonationIntent>(DONATION_INTENT_EVENT, { detail }));
}

/**
 * Открыть панель помощи без назначения: взнос «просто так», без сбора и без
 * подарка. На страницах, где панель живёт в диалоге, диалог слушает и это
 * событие, и событие назначения.
 */
export const DONATE_OPEN_EVENT = "lightyar:donate-open";

export function requestDonateOpen() {
  window.dispatchEvent(new Event(DONATE_OPEN_EVENT));
}

/**
 * Подтянуть код панели помощи заранее, при наведении или фокусе на кнопку:
 * панель грузится динамически, и к клику её код уже на месте. Проверка на
 * окно, чтобы модуль не попадал в серверную сборку.
 */
export function preloadDonatePanel() {
  if (typeof window !== "undefined") void import("@/components/campaigns/campaign-donate-panel");
}

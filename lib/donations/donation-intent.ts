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

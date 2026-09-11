export interface RecentDonation {
  name: string;
  amount: number;
  type: "once" | "monthly";
}

export type DonationFeedState =
  | { status: "ready"; items: RecentDonation[] }
  | { status: "empty"; items: [] }
  | { status: "unavailable"; items: [] };

import { DONATION_TIERS, type DonationTier } from "./donation-tiers.ts";

export function getDonationTier(amount: number) {
  if (!Number.isFinite(amount)) return DONATION_TIERS[0];

  let tier: DonationTier = DONATION_TIERS[0];
  for (const candidate of DONATION_TIERS) {
    if (amount >= candidate.amount) tier = candidate;
  }
  return tier;
}

import { ArrowRight, BadgeRussianRuble, Bandage, Bone, HeartPulse, Stethoscope } from "lucide-react";
import { DONATION_TIERS, type DonationTier } from "@/lib/donations/donation-tiers";

const TIER_ICONS = [Bone, Bandage, Stethoscope, HeartPulse] as const;

interface DonationTierPickerProps {
  selected: DonationTier;
  customAmount: string;
  onSelect: (amount: number) => void;
  onCustomAmountChange: (amount: string) => void;
}

export function DonationTierPicker({
  selected,
  customAmount,
  onSelect,
  onCustomAmountChange,
}: DonationTierPickerProps) {
  return (
    <fieldset className="donation-tier-picker">
      <legend>Сколько перевести</legend>
      <div className="donation-tier-picker__list">
        {DONATION_TIERS.map((tier, index) => {
          const TierIcon = TIER_ICONS[index];
          return (
            <label
              key={tier.amount}
              className="donation-tier"
              data-selected={customAmount === "" && selected.amount === tier.amount}
            >
              <input
                type="radio"
                name="donation-tier"
                value={tier.amount}
                checked={customAmount === "" && selected.amount === tier.amount}
                onChange={() => onSelect(tier.amount)}
              />
              <span className="donation-tier__icon" aria-hidden="true">
                <TierIcon size={25} strokeWidth={1.7} />
              </span>
              <span className="donation-tier__copy">
                <strong>{tier.amount.toLocaleString("ru-RU")} ₽</strong>
                <small>{tier.description}</small>
              </span>
              <span className="donation-tier__mark" aria-hidden="true" />
            </label>
          );
        })}
        <label
          className="donation-tier donation-tier--custom"
          data-selected={customAmount !== ""}
          htmlFor="donation-custom-amount"
        >
          <span className="donation-tier__icon" aria-hidden="true">
            <BadgeRussianRuble size={25} strokeWidth={1.7} />
          </span>
          <span className="donation-tier__copy">
            <strong>Другая сумма</strong>
            <small>Укажите удобную сумму</small>
          </span>
          <span className="donation-tier__custom-control">
            <input
              id="donation-custom-amount"
              name="customAmount"
              type="number"
              inputMode="numeric"
              min="50"
              step="50"
              placeholder="700"
              value={customAmount}
              onChange={(event) => onCustomAmountChange(event.target.value)}
              aria-label="Другая сумма пожертвования"
            />
            <span aria-hidden="true">₽</span>
          </span>
        </label>
      </div>
      <p className="donation-tier-picker__hint" aria-hidden="true">
        Листайте варианты <ArrowRight size={16} />
      </p>
    </fieldset>
  );
}

import { ArrowRight, BadgeRussianRuble, Bandage, Bone, HeartPulse, Stethoscope } from "lucide-react";
import { DONATION_TIERS, type DonationTier } from "@/lib/donations/donation-tiers";
import { useId } from "react";

const TIER_ICONS = [Bone, Bandage, Stethoscope, HeartPulse] as const;

interface DonationTierPickerProps {
  compact?: boolean;
  selected: DonationTier;
  customAmount: string;
  customActive?: boolean;
  amountError?: string;
  onSelect: (amount: number) => void;
  onCustomAmountChange: (amount: string) => void;
}

export function DonationTierPicker({
  compact = false,
  selected,
  customAmount,
  customActive = customAmount !== "",
  amountError,
  onSelect,
  onCustomAmountChange,
}: DonationTierPickerProps) {
  const inputId = useId();
  return (
    <fieldset className="donation-tier-picker" data-compact={compact}>
      <legend>Сколько перевести</legend>
      <div className="donation-tier-picker__list">
        {DONATION_TIERS.map((tier, index) => {
          const TierIcon = TIER_ICONS[index];
          return (
            <label
              key={tier.amount}
              className="donation-tier"
              data-selected={!customActive && selected.amount === tier.amount}
            >
              <input
                type="radio"
                name="donation-tier"
                value={tier.amount}
                checked={!customActive && selected.amount === tier.amount}
                onChange={() => onSelect(tier.amount)}
              />
              <span className="donation-tier__icon" aria-hidden="true">
                <TierIcon size={25} strokeWidth={1.7} />
              </span>
              <span className="donation-tier__copy">
                <strong>{tier.amount.toLocaleString("ru-RU")} ₽</strong>
                {!compact && <small>{tier.description}</small>}
              </span>
              <span className="donation-tier__mark" aria-hidden="true" />
            </label>
          );
        })}
        <label
          className="donation-tier donation-tier--custom"
          data-selected={customActive}
          htmlFor={`${inputId}-custom-amount`}
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
              id={`${inputId}-custom-amount`}
              name="customAmount"
              type="number"
              inputMode="numeric"
              min="50"
              step="1"
              placeholder="700"
              value={customAmount}
              onChange={(event) => onCustomAmountChange(event.target.value)}
              aria-label="Другая сумма пожертвования"
              aria-invalid={Boolean(amountError)}
              aria-describedby={amountError ? `${inputId}-amount-error` : undefined}
            />
            <span aria-hidden="true">₽</span>
          </span>
        </label>
      </div>
      {amountError && <p className="donation-field-error" id={`${inputId}-amount-error`} role="status">{amountError}</p>}
      <p className="donation-tier-picker__hint" aria-hidden="true">
        Листайте варианты <ArrowRight size={16} />
      </p>
    </fieldset>
  );
}

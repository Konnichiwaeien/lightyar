import Image from "next/image";
import type { DonationTier } from "@/lib/donations/donation-tiers";

const MOOD_ASSETS = {
  worried: "/donate/serkan/worried.webp",
  cautious: "/donate/serkan/cautious.webp",
  relieved: "/donate/serkan/relieved.webp",
  trusting: "/donate/serkan/trusting.webp",
} as const;

export function DonationPet({ tier }: { tier: DonationTier }) {
  return (
    <div className="donation-pet" data-mood={tier.mood}>
      <div className="donation-pet__stage" aria-hidden="true">
        {(Object.keys(MOOD_ASSETS) as Array<keyof typeof MOOD_ASSETS>).map((mood) => (
          <Image
            key={mood}
            src={MOOD_ASSETS[mood]}
            alt=""
            fill
            sizes="(max-width: 767px) 94vw, (max-width: 1199px) 60vw, 34vw"
            className="donation-pet__image"
            data-active={mood === tier.mood}
            priority={mood === "cautious"}
          />
        ))}
        <span className="donation-pet__ground" />
      </div>
    </div>
  );
}

import { DonationExperience } from "@/components/donations/donation-experience";
import type { DonationFeedState } from "@/lib/donations/donation-feed-state";

export function PaymentSection({ feed }: { feed: DonationFeedState }) {
  return (
    <section className="payment-section" id="donate">
      <header className="payment-section__header">
        <div>
          <span className="payment-section__kicker">На счету каждый рубль</span>
          <h2><span className="payment-section__heading-main">ПОМОЩЬ</span> <em>НЕ МОЖЕТ ЖДАТЬ.</em></h2>
        </div>
      </header>
      <DonationExperience feed={feed} />
    </section>
  );
}

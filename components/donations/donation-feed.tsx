import { Flower2, Gift, HandHeart, Heart, Leaf, PawPrint, Smile, Sparkles, Star, Sun } from "lucide-react";
import type { DonationFeedState } from "@/lib/donations/donation-feed-state";

const FEED_ICONS = [
  Heart,
  PawPrint,
  Sparkles,
  Star,
  Sun,
  Flower2,
  HandHeart,
  Leaf,
  Smile,
  Gift,
] as const;

export function DonationFeed({ feed }: { feed: DonationFeedState }) {
  return (
    <aside className="donation-feed" aria-labelledby="donation-feed-title">
      <div className="donation-feed__heading">
        <span className="donation-feed__heading-icon" aria-hidden="true"><HandHeart size={24} /></span>
        <div>
          <span className="donation-feed__kicker">Помощники фонда</span>
          <h3 id="donation-feed-title">Люди, которые <em>рядом</em></h3>
        </div>
      </div>

      {feed.status === "ready" && (
        <ol className="donation-feed__list" data-lenis-prevent tabIndex={0} aria-label="Список помощников фонда">
          {feed.items.map((donation, index) => {
            const FeedIcon = FEED_ICONS[index % FEED_ICONS.length];
            return (
              <li key={`${donation.name}-${donation.amount}-${index}`} data-tone={index % 6}>
                <span className="donation-feed__icon" aria-hidden="true">
                  <FeedIcon size={19} strokeWidth={1.8} />
                </span>
                <span className="donation-feed__person">
                  <strong>{donation.name}</strong>
                  <small>{donation.type === "monthly" ? "Опека · каждый месяц" : "Разовая помощь"}</small>
                </span>
                <span className="donation-feed__amount">+{donation.amount.toLocaleString("ru-RU")} ₽</span>
              </li>
            );
          })}
        </ol>
      )}

      {feed.status === "empty" && (
        <div className="donation-feed__state">
          <strong>Здесь появятся переводы</strong>
          <p>Лента уже на месте и начнёт заполняться, когда в системе появятся пожертвования.</p>
        </div>
      )}

      {feed.status === "unavailable" && (
        <div className="donation-feed__state">
          <strong>Лента временно недоступна</strong>
          <p>Мы не подменяем данные выдуманными переводами. Попробуйте открыть страницу позже.</p>
        </div>
      )}
    </aside>
  );
}

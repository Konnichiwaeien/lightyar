import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("wishlist gifts and homepage campaigns open the shared donation form with context", async () => {
  const [intent, needs, campaigns, experience, css] = await Promise.all([
    read("../../lib/donations/donation-intent.ts"),
    read("../sections/needs-section.tsx"),
    read("../sections/campaigns-section.tsx"),
    read("./donation-experience.tsx"),
    read("./donation-experience.css"),
  ]);

  assert.match(intent, /DONATION_INTENT_EVENT/);
  assert.match(intent, /kind:\s*"gift"\s*\|\s*"campaign"/);
  assert.match(intent, /new CustomEvent/);

  assert.match(needs, /requestDonationIntent\(\{[\s\S]*?kind:\s*"gift"[\s\S]*?amount:\s*item\.approxPrice/);
  assert.doesNotMatch(needs, /wishlist-btn wishlist-btn--quiet" href="#donate"/);

  assert.match(campaigns, /requestDonationIntent\(\{[\s\S]*?kind:\s*"campaign"[\s\S]*?amount:\s*500/);
  assert.match(campaigns, />\s*Подробнее\s*</);
  assert.doesNotMatch(campaigns, /href=\{`\/campaigns\/\$\{fund\.id\}`\}[\s\S]{0,500}>\s*[\s\S]*?Помочь/);

  assert.match(experience, /addEventListener\(DONATION_INTENT_EVENT/);
  assert.match(experience, /setCadence\("once"\)/);
  assert.match(experience, /donation-intent/);
  assert.match(experience, /role="status"/);
  assert.match(experience, /getLenis\(\)\?\.scrollTo/);
  assert.match(css, /\.donation-intent\s*\{/);
});

test("footer, volunteering, wishlist cards and overlays retain the requested layout contracts", async () => {
  const [footer, volunteer, volunteerCss, needs, needsCss, modal, menu] = await Promise.all([
    read("../sections/footer.tsx"),
    read("../sections/volunteer-section.tsx"),
    read("../sections/volunteer-section.css"),
    read("../sections/needs-section.tsx"),
    read("../sections/needs-section.css"),
    read("../wishlist/gift-order-modal.tsx"),
    read("../layout/menu-overlay.tsx"),
  ]);

  assert.match(footer, /<BrandLogo/);
  assert.match(footer, /size-20/);

  assert.doesNotMatch(volunteer, /Прогулка даёт собаке движение/);
  assert.doesNotMatch(volunteer, /Можно быть рядом/);
  assert.doesNotMatch(volunteerCss, /\.volunteer-scene figcaption/);
  assert.doesNotMatch(volunteerCss, /\.volunteer-kicker/);

  assert.match(needs, /wishlist-card__content/);
  assert.match(needs, /wishlist-card__actions/);
  assert.match(needsCss, /\.wishlist-track \.swiper-slide\s*\{[\s\S]*?height:\s*auto/);
  assert.match(needsCss, /\.wishlist-card__actions\s*\{[\s\S]*?margin-top:\s*auto/);

  assert.match(modal, /className="gift-body"\s+data-lenis-prevent/);
  assert.match(menu, /data-lenis-prevent/);
  assert.match(menu, /overflow-y-auto/);
  assert.match(menu, /min-h-full/);
});

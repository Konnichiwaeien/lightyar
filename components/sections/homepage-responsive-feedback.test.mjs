import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("screenshot feedback remains encoded in the homepage sections", async () => {
  const [hero, about, ring, ringCss, stories, donationCss, globals, needs, needsCss, volunteer, volunteerCss, news, newsCss] = await Promise.all([
    read("./hero-section.tsx"),
    read("./about-section.tsx"),
    read("./rescued-ring.tsx"),
    read("./rescued-ring.css"),
    read("./dogs-stories-section.tsx"),
    read("../donations/donation-experience.css"),
    read("../../app/globals.css"),
    read("./needs-section.tsx"),
    read("./needs-section.css"),
    read("./volunteer-section.tsx"),
    read("./volunteer-section.css"),
    read("../news/news-card.tsx"),
    read("../news/news-card.css").catch(() => ""),
  ]);

  assert.match(hero, /hero-actions/);
  assert.match(hero, /hero-actions__play/);
  assert.match(hero, /hero-actions__secondary-group/);
  assert.match(hero, /HeartHandshake/);
  assert.match(hero, /PawPrint/);
  assert.match(hero, /hero-action__icon/);
  assert.match(globals, /\.hero-actions\s*\{[\s\S]*?display:\s*flex/);
  assert.match(globals, /\.hero-actions\s*\{[\s\S]*?justify-content:\s*flex-start/);
  assert.match(globals, /@media \(min-width: 48rem\)[\s\S]*?\.hero-actions\s*\{[\s\S]*?justify-content:\s*flex-end/);
  assert.doesNotMatch(globals, /\.hero-actions\s*\{[^}]*justify-content:\s*center/);
  assert.match(globals, /\.hero-actions__play\s*\{[\s\S]*?inline-size:\s*2\.75rem/);
  assert.match(globals, /\.hero-actions__secondary-group\s*\{[\s\S]*?display:\s*inline-flex/);
  assert.doesNotMatch(globals, /\.hero-action--primary\s*\{[^}]*flex:\s*1\s+0\s+100%/);
  assert.doesNotMatch(about, /ABOUT_MOMENTS|about-moments/);
  assert.match(about, /text-\[#F5A623\][^\n]*>большое/);
  assert.match(about, /about-panorama/);
  assert.match(about, /about-stat__portrait/);
  assert.match(about, /about-section/);
  assert.match(globals, /\.about-section\s*\{[^}]*background:\s*#fff/);
  assert.match(globals, /\.about-panorama\s*\{[\s\S]*?aspect-ratio:\s*24\s*\/\s*17/);
  assert.match(globals, /\.about-panorama__image\s*\{[^}]*object-position:\s*50%\s+72%/);
  assert.match(globals, /@media \(min-width: 48rem\)[\s\S]*?\.about-panorama\s*\{[\s\S]*?aspect-ratio:\s*12\s*\/\s*5/);
  assert.match(globals, /\.about-stats\s*\{[\s\S]*?justify-items:\s*center/);
  assert.match(globals, /\.about-stat__portrait\s*\{[\s\S]*?inline-size:\s*clamp\(9rem/);
  assert.doesNotMatch(about, /font-light opacity-60/);
  assert.match(ring, /const still = Boolean\(reduced\);/);
  assert.match(ring, /const compactRingQuery = "\(max-width: 1180px\)"/);
  assert.match(ringCss, /@media \(max-width: 1180px\)[\s\S]*?--ring-w:\s*560[\s\S]*?--ring-h:\s*560/);
  assert.match(ringCss, /@media \(max-width: 1180px\)[\s\S]*?\.ring-visual\s*\{[\s\S]*?aspect-ratio:\s*1/);
  assert.match(ringCss, /\.ring-visual\s*\{[\s\S]*?container-type:\s*inline-size/);
  assert.match(ringCss, /\.ring\s*\{[\s\S]*?background:\s*#fff/);
  assert.match(ringCss, /\.ring::before\s*\{[\s\S]*?animation:\s*ring-ambient-drift/);
  assert.match(ringCss, /\.ring::after\s*\{[\s\S]*?animation:\s*ring-ambient-pulse/);
  assert.match(ringCss, /\.ring-mark\s*\{[\s\S]*?display:\s*inline-grid[\s\S]*?place-items:\s*center/);
  assert.match(ring, /className="ring-mark__value"/);
  assert.match(ringCss, /\.ring-mark__value\s*\{[\s\S]*?transform:\s*translateY\(-0\.0[4-9]em\)/);
  assert.match(ring, /Теперь помощь не держится/);
  assert.match(ring, /ring-aside__lead-accent[^>]*>на одном человеке\./);
  assert.doesNotMatch(ringCss, /\.ring-stage\s*\{[^}]*container-type:\s*inline-size/);
  assert.match(stories, /pet-stories__stage/);
  assert.doesNotMatch(stories, /Ищут дом|Скролл → панорама/i);
  assert.match(globals, /\.pet-stories__stage\s*\{[\s\S]*?padding-block:\s*clamp\(/);
  assert.match(stories, /pet-story-card/);
  assert.match(globals, /\.pet-story-card\s*\{[\s\S]*?block-size:\s*clamp\(22rem,\s*64svh,\s*52rem\)/);
  assert.match(
    donationCss,
    /@media \(max-width: 767px\)[\s\S]*?\.donation-tier-picker__list\s*\{[\s\S]*?grid-auto-flow:\s*column[\s\S]*?overflow-x:\s*auto/,
  );
  assert.match(
    donationCss,
    /@media \(max-width: 767px\)[\s\S]*?\.donation-feed__list\s*\{[\s\S]*?grid-template-columns:\s*1fr[\s\S]*?overflow-y:\s*auto/,
  );
  assert.match(
    donationCss,
    /@media \(max-width: 767px\)[\s\S]*?\.donation-provider-button\s*\{[\s\S]*?background:\s*var\(--donation-amber\)/,
  );
  assert.match(
    donationCss,
    /@media \(max-width: 767px\)[\s\S]*?\.donation-experience__vow\s*\{[\s\S]*?max-width:\s*100%[\s\S]*?min-height:\s*0/,
  );
  assert.match(donationCss, /\.donation-pet\s*\{[^}]*position:\s*absolute[^}]*background:\s*transparent/);
  assert.match(donationCss, /\.donation-experience__panel::before\s*\{[\s\S]*?radial-gradient\(circle at 84% 38%/);
  assert.doesNotMatch(donationCss, /%3Crect x='39'|%3Crect x='16'/);
  assert.match(
    donationCss,
    /\.donation-cadence__options label\[data-selected="true"\]\s*\{[^}]*background:\s*var\(--donation-amber\)/,
  );
  assert.match(donationCss, /\.donation-provider-button\s*\{[^}]*background:\s*var\(--donation-amber\)/);
  assert.match(donationCss, /\.donation-feed\s*\{[\s\S]*?linear-gradient\(145deg,\s*#fff8e8/);
  assert.match(needs, /Что нужно подопечным/);
  assert.doesNotMatch(needs, /Вишлист приюта|позици[яи].*нужны.*прямо сейчас/i);
  assert.match(needs, /wishlist-choice/);
  assert.match(needs, /ORBIT_ANGLES\s*=\s*\[-90,\s*30,\s*150\]/);
  assert.match(needs, />Оплатить пожертвованием</);
  assert.match(needsCss, /\.wishlist-btn\s*\{[\s\S]*?background:\s*var\(--w-card\)/);
  assert.match(needsCss, /@media \(max-width: 1023px\)[\s\S]*?\.wishlist-card__media\s*\{[\s\S]*?min-height:\s*clamp\(/);
  assert.match(volunteer, /Footprints/);
  assert.match(volunteer, /Camera/);
  assert.match(volunteer, /HouseHeart/);
  assert.doesNotMatch(volunteer, /number:\s*"0[123]"/);
  assert.match(volunteerCss, /\.volunteer-section\s*\{[\s\S]*?min-height:\s*100svh/);
  assert.match(volunteerCss, /\.volunteer-scene\s*\{[\s\S]*?position:\s*absolute[\s\S]*?inset:\s*0/);
  assert.match(volunteerCss, /\.volunteer-scene::after\s*\{/);
  assert.doesNotMatch(volunteerCss, /background:\s*#202329/);
  assert.match(news, /import "\.\/news-card\.css"/);
  assert.match(news, /news-card__media/);
  assert.match(newsCss, /@media \(max-width: 1023px\)[\s\S]*?\.news-card__media\s*\{[\s\S]*?min-height:\s*clamp\(/);
});

test("wishlist tablet rail shows one and a half cards with a shorter media stage", async () => {
  const [needs, needsCss] = await Promise.all([
    read("./needs-section.tsx"),
    read("./needs-section.css"),
  ]);

  assert.match(needs, /560:\s*\{\s*slidesPerView:\s*1\.5\s*\}/);
  assert.match(needs, /1100:\s*\{\s*slidesPerView:\s*3\.1\s*\}/);
  assert.match(needsCss, /min-height:\s*clamp\(21\.25rem,\s*49svh,\s*32\.3rem\)/);
});

test("wishlist objects form an evenly spaced orbit around the cat", async () => {
  const [needs, needsCss] = await Promise.all([
    read("./needs-section.tsx"),
    read("./needs-section.css"),
  ]);

  assert.doesNotMatch(needs, /const SEATS/);
  assert.match(needs, /const ORBIT_ANGLES\s*=\s*\[-90,\s*30,\s*150\]/);
  assert.match(needs, /wishlist-orbit__slot/);
  assert.match(needs, /rotate:\s*\[angle,\s*angle\s*\+\s*360\]/);
  assert.match(needs, /rotate:\s*\[-angle,\s*-angle\s*-\s*360\]/);
  assert.match(needsCss, /\.wishlist-orbit\s*\{[\s\S]*?aspect-ratio:\s*1/);
  assert.match(needsCss, /\.wishlist-orbit__slot\s*\{[\s\S]*?position:\s*absolute[\s\S]*?inset:\s*0/);
  assert.doesNotMatch(needs, /style=\{\{\s*left:/);
});

test("phone rescued ring keeps a readable centre inside the same square geometry", async () => {
  const [ring, ringCss] = await Promise.all([
    read("./rescued-ring.tsx"),
    read("./rescued-ring.css"),
  ]);

  assert.doesNotMatch(ring, /data-ring-index/);
  assert.match(ringCss, /@media \(max-width: 560px\)[\s\S]*?--ring-portrait:\s*82px/);
  assert.doesNotMatch(ringCss, /\.ring-center::before\s*\{/);
  assert.doesNotMatch(ringCss, /data-ring-index="8"/);
  assert.match(ringCss, /@media \(max-width: 560px\)[\s\S]*?\.ring-center__copy\s*\{[\s\S]*?width:\s*58%/);
  assert.match(ringCss, /@media \(max-width: 560px\)[\s\S]*?\.ring-line\s*\{[\s\S]*?font-size:\s*clamp\(1\.35rem,\s*7vw,\s*1\.75rem\)/);
});

test("mobile donation annotation keeps custom amount last and lightens the heading", async () => {
  const [payment, donationCss] = await Promise.all([
    read("./payment-section.tsx"),
    read("../donations/donation-experience.css"),
  ]);

  assert.match(payment, /payment-section__heading-main/);
  assert.match(donationCss, /\.payment-section__heading-main\s*\{[^}]*font-weight:\s*560/);
  assert.doesNotMatch(payment, /Государственного финансирования/);
  assert.doesNotMatch(donationCss, /\.payment-section__header\s*>\s*p\s*\{/);
  assert.match(donationCss, /@media \(max-width: 767px\)[\s\S]*?\.donation-tier--custom\s*\{[^}]*grid-column:\s*auto/);
});

test("rescued section uses the approved factual lead without a decorative transition band", async () => {
  const [ring, ringCss] = await Promise.all([
    read("./rescued-ring.tsx"),
    read("./rescued-ring.css"),
  ]);

  assert.doesNotMatch(ring, /ring-aside__kicker|>Кто мы</);
  assert.match(ring, /Теперь помощь не держится/);
  assert.match(ring, /ring-aside__lead-accent[^>]*>на одном человеке\./);
  assert.match(ring, /куда ушёл каждый рубль/);
  assert.doesNotMatch(ringCss, /\.ring-center::before\s*\{/);
  assert.match(ringCss, /\.ring::before\s*\{/);
  assert.match(
    ringCss,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.ring::before,[\s\S]*?\.ring::after\s*\{[\s\S]*?animation:\s*none/,
  );
});

test("volunteer composition is centered and keeps its editorial route visible", async () => {
  const [volunteer, volunteerCss] = await Promise.all([
    read("./volunteer-section.tsx"),
    read("./volunteer-section.css"),
  ]);
  assert.match(volunteer, /motion\.li/);
  assert.match(volunteer, /whileInView/);
  assert.match(volunteer, /initial=\{false\}/);
  assert.match(volunteerCss, /\.volunteer-copy\s*\{[\s\S]*?text-align:\s*center/);
  assert.match(volunteerCss, /\.volunteer-action-panel\s*\{[\s\S]*?border:\s*0[\s\S]*?background:\s*transparent[\s\S]*?box-shadow:\s*none/);
  assert.match(volunteerCss, /\.volunteer-action-panel ol\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3[\s\S]*?background:\s*transparent/);
  assert.match(volunteerCss, /\.volunteer-role\s*\{[\s\S]*?border-top:\s*1px solid rgba\(255,\s*193,\s*79[\s\S]*?background:\s*transparent/);
  assert.match(volunteerCss, /\.volunteer-role__number\s*\{[\s\S]*?font-family:\s*Georgia/);
  assert.doesNotMatch(volunteerCss, /\.volunteer-role\s*\{[^}]*box-shadow:/);
  assert.match(
    volunteerCss,
    /@media \(max-width: 700px\)[\s\S]*?\.volunteer-editorial\s*\{[\s\S]*?grid-template-rows:\s*auto auto[\s\S]*?align-content:\s*center/,
  );
  assert.match(
    volunteerCss,
    /@media \(max-width: 960px\)[\s\S]*?\.volunteer-action-panel\s*>\s*a\s*\{[^}]*justify-self:\s*center/,
  );
});

test("mobile news annotation reduces the media stage by fifteen percent", async () => {
  const newsCss = await read("../news/news-card.css");
  assert.match(
    newsCss,
    /@media \(max-width: 767px\)[\s\S]*?\.news-card__media\s*\{[\s\S]*?height:\s*clamp\(22rem,\s*52\.7svh,\s*30\.6rem\)/,
  );
});

test("footer annotation uses a recognisable filled VK mark", async () => {
  const footer = await read("./footer.tsx");
  assert.match(footer, /const VKIcon[\s\S]*?fill="currentColor"/);
  assert.match(footer, /Official VK mark from Simple Icons/);
  assert.match(footer, /m9\.489\.004\.729/);
  assert.doesNotMatch(footer, /M3\.35 6\.25/);
});

test("official foundation copy and requested editorial emphasis are present", async () => {
  const [about, ringCss, payment, donationCss, footer] = await Promise.all([
    read("./about-section.tsx"),
    read("./rescued-ring.css"),
    read("./payment-section.tsx"),
    read("../donations/donation-experience.css"),
    read("./footer.tsx"),
  ]);

  assert.match(about, /АНБО «Светлый» появилась в Ярославле в октябре 2024 года/);
  assert.match(about, /pb-20[\s\S]*?md:pb-28/);
  assert.match(ringCss, /\.ring-mark\s*\{[\s\S]*?display:\s*inline-grid[\s\S]*?place-items:\s*center/);
  assert.match(payment, /ПОМОЩЬ[\s\S]*?НЕ МОЖЕТ ЖДАТЬ\./);
  assert.doesNotMatch(payment, /Государственного финансирования у фонда нет/);
  assert.match(donationCss, /\.payment-section__header h2\s*\{[\s\S]*?text-transform:\s*uppercase/);
  assert.match(footer, /АНБО «Светлый» помогает бездомным и попавшим в беду животным/);
});

test("approved homepage copy is present without changing dynamic animal counts", async () => {
  const [hero, about, ring, payment, experience, tiers, needs, volunteer, news, footer] = await Promise.all([
    read("./hero-section.tsx"),
    read("./about-section.tsx"),
    read("./rescued-ring.tsx"),
    read("./payment-section.tsx"),
    read("../donations/donation-experience.tsx"),
    read("../../lib/donations/donation-tiers.ts"),
    read("./needs-section.tsx"),
    read("./volunteer-section.tsx"),
    read("./news-section.tsx"),
    read("./footer.tsx"),
  ]);

  assert.match(hero, /Помогаем бездомным животным · Ярославль/);
  assert.match(about, /но наша команда помогает\s+животным уже много лет/);
  assert.match(ring, /Кого-то забрали из подвала/);
  assert.match(ring, /Раньше волонтёры спасали животных поодиночке/);
  assert.match(ring, /У нас нет большого приюта/);
  assert.match(ring, /\{looking\} всё ещё ждут семью/);
  assert.match(payment, /ПОМОЩЬ[\s\S]*?НЕ МОЖЕТ ЖДАТЬ\./);
  assert.match(experience, /Ваш перевод помогает не откладывать[\s\S]*?корм, анализы и лечение/);
  assert.match(tiers, /Пополнит запас корма/);
  assert.match(needs, /Что нужно подопечным/);
  assert.match(needs, /покажем в отчёте, кому она помогла/);
  assert.match(volunteer, /Можно приехать погулять с собаками/);
  assert.match(news, /Новости <span className="italic text-amber-500">«Светлого»<\/span>/);
  assert.match(footer, /Даём им временный дом и уход/);
  assert.match(footer, /Ответим, как только сможем/);

  assert.match(ring, /\{dogs\} собак и \{cats\} кошек/);
  assert.match(ring, /\{total\}/);
  assert.match(ring, /\{looking\}/);
});

test("desktop review keeps the ring stable, pet cards, donation dog and wishlist edges intact", async () => {
  const [ring, globals, donationCss, needs, needsCss] = await Promise.all([
    read("./rescued-ring.tsx"),
    read("../../app/globals.css"),
    read("../donations/donation-experience.css"),
    read("./needs-section.tsx"),
    read("./needs-section.css"),
  ]);

  assert.doesNotMatch(ring, /const SCATTER|shiftX|shiftY/);
  assert.match(ring, /offsetDistance:\s*pauseOrbit\s*\?\s*`\$\{offset\}%`\s*:\s*distance/);
  assert.match(
    globals,
    /@media \(min-width: 64rem\)[\s\S]*?\.pet-story-card\s*\{[\s\S]*?block-size:\s*clamp\(26rem,\s*55svh,\s*34rem\)/,
  );
  assert.match(donationCss, /\.donation-experience__panel\s*\{[\s\S]*?overflow:\s*visible/);
  assert.match(donationCss, /\.donation-experience__panel\s*\{[\s\S]*?min-height:\s*42rem/);
  assert.match(donationCss, /\.donation-experience__panel::before\s*\{[\s\S]*?z-index:\s*2/);
  assert.match(donationCss, /\.donation-pet\s*\{[\s\S]*?z-index:\s*1[\s\S]*?pointer-events:\s*none/);
  assert.match(donationCss, /\.donation-experience__form\s*\{[\s\S]*?z-index:\s*3/);
  assert.match(donationCss, /\.donation-tier--custom\s*\{[^}]*grid-column:\s*auto/);
  assert.doesNotMatch(needsCss, /mask-image:\s*linear-gradient\(90deg/);
  assert.match(needsCss, /\.wishlist-stage\s*\{[\s\S]*?margin-bottom:\s*clamp\(-5rem/);
  assert.match(needsCss, /@media \(max-width: 860px\)[\s\S]*?\.wishlist-stage\s*\{[\s\S]*?margin-bottom:\s*clamp\(-2\.5rem/);
  assert.match(needs, /MessageCircleHeart/);
  assert.match(needs, /wishlist-btn wishlist-btn--light[\s\S]*?<MessageCircleHeart/);
});

test("desktop donation pet stands behind the compact form edge", async () => {
  const donationCss = await read("../donations/donation-experience.css");

  assert.match(
    donationCss,
    /\.donation-pet\s*\{[\s\S]*?z-index:\s*1[\s\S]*?top:\s*0[\s\S]*?bottom:\s*auto[\s\S]*?transform:\s*translateY\(-52%\)/,
  );
  assert.match(
    donationCss,
    /\.donation-experience__form\s*\{[\s\S]*?z-index:\s*3/,
  );
  assert.match(donationCss, /\.donation-experience__panel::before\s*\{[\s\S]*?z-index:\s*2/);
  assert.match(donationCss, /@media \(max-width: 1120px\)[\s\S]*?\.donation-pet\s*\{[\s\S]*?position:\s*absolute[\s\S]*?top:\s*0/);
  assert.doesNotMatch(
    donationCss,
    /\.donation-pet\s*\{[\s\S]*?top:\s*clamp\(4\.5rem,\s*8vw,\s*8rem\)[\s\S]*?bottom:\s*-2\.5rem/,
  );
  assert.doesNotMatch(donationCss, /\.payment-section__header\s*>\s*p\s*\{/);
  assert.match(donationCss, /\.donation-tab-panels\s*\{[\s\S]*?display:\s*grid/);
  assert.match(donationCss, /\.donation-tab-panel\s*\{[\s\S]*?grid-area:\s*1\s*\/\s*1/);
  assert.match(donationCss, /\.donation-pet\s*\{[\s\S]*?width:\s*clamp\(18rem,\s*28vw,\s*26rem\)/);
});

test("volunteer choices use an open editorial list instead of another panel", async () => {
  const [volunteer, volunteerCss] = await Promise.all([
    read("./volunteer-section.tsx"),
    read("./volunteer-section.css"),
  ]);

  assert.match(volunteer, /volunteer-role__number/);
  assert.match(volunteer, /volunteer-role__copy/);
  assert.match(volunteer, /String\(index \+ 1\)\.padStart\(2, "0"\)/);
  assert.match(volunteerCss, /\.volunteer-action-panel\s*\{[\s\S]*?border:\s*0[\s\S]*?background:\s*transparent[\s\S]*?box-shadow:\s*none/);
  assert.match(volunteerCss, /\.volunteer-action-panel ol\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3[\s\S]*?background:\s*transparent/);
  assert.match(volunteerCss, /\.volunteer-role__number\s*\{/);
  assert.match(volunteerCss, /\.volunteer-role__number\s*\{[\s\S]*?color:\s*#f59e0b/);
  assert.match(volunteerCss, /\.volunteer-role\s*\{[\s\S]*?background:\s*transparent/);
  assert.match(volunteerCss, /\.volunteer-role\s*\{[\s\S]*?border-top:\s*1px solid rgba\(255,\s*193,\s*79/);
  assert.match(
    volunteerCss,
    /@media \(max-width: 960px\)[\s\S]*?\.volunteer-action-panel\s*\{[\s\S]*?width:\s*min\(100% - 4rem,\s*44rem\)[\s\S]*?\.volunteer-action-panel ol\s*\{[\s\S]*?grid-template-columns:\s*1fr[\s\S]*?width:\s*100%/,
  );
  assert.doesNotMatch(volunteer, /whileHover=\{[^}]*x:\s*7/);
  assert.doesNotMatch(volunteerCss, /backdrop-filter:\s*blur/);
  assert.doesNotMatch(
    volunteerCss,
    /\.volunteer-role:hover,\s*\.volunteer-role:focus-within\s*\{[^}]*background:/,
  );
  assert.match(volunteerCss, /\.volunteer-role\s*\{[\s\S]*?color:\s*#fffaf0/);
  assert.match(volunteerCss, /\.volunteer-role p\s*\{[\s\S]*?color:\s*rgba\(255,\s*250,\s*240/);
});

test("latest browser annotations keep section hierarchy and typography coherent", async () => {
  const [stories, globals, experience, needsCss] = await Promise.all([
    read("./dogs-stories-section.tsx"),
    read("../../app/globals.css"),
    read("../donations/donation-experience.tsx"),
    read("./needs-section.css"),
  ]);

  assert.doesNotMatch(stories, /Ищут дом|Скролл → панорама/i);
  assert.match(globals, /\.pet-stories__stage\s*\{[\s\S]*?padding-block:\s*clamp\(3rem/);
  assert.ok(
    experience.indexOf('className="donation-experience__panel"') < experience.indexOf('className="donation-tabs"'),
    "the donation tabs belong inside the shared form surface",
  );
  assert.ok(
    experience.indexOf('className="donation-tabs"') < experience.indexOf('id="donation-panel-help"'),
    "the shared tabs stay before both tab panels",
  );
  assert.match(needsCss, /\.wishlist-stage__copy h2\s*\{[\s\S]*?font-family:\s*var\(--font-sans\)/);
  assert.match(
    needsCss,
    /\.wishlist-stage__copy h2 em\s*\{[\s\S]*?font-family:\s*var\(--font-serif\)[\s\S]*?color:\s*var\(--w-amber\)/,
  );
});

test("latest mobile polish tightens the wishlist, centers volunteer marks, and removes duplicate socials", async () => {
  const [needs, needsCss, volunteer, volunteerCss, footer] = await Promise.all([
    read("./needs-section.tsx"),
    read("./needs-section.css"),
    read("./volunteer-section.tsx"),
    read("./volunteer-section.css"),
    read("./footer.tsx"),
  ]);

  assert.match(needs, /<span>Соберём<\/span>[\s\S]*?<em>посылку<\/em>/);
  assert.match(needs, /const orbitMotionEnabled = reduced !== true/);
  assert.match(needs, /style=\{\{ rotate: angle \}\}[\s\S]*?animate=\{orbitMotionEnabled \? \{ rotate: \[angle, angle \+ 360\] \} : undefined\}/);
  assert.doesNotMatch(needs, /style=\{reduced \?/);
  assert.match(needsCss, /\.wishlist-stage__copy h2 em\s*\{[\s\S]*?display:\s*block[\s\S]*?font-size:\s*1\.08em/);
  assert.match(
    needsCss,
    /@media \(max-width: 860px\)[\s\S]*?\.wishlist-scene\s*\{[\s\S]*?margin-top:\s*clamp\(-7rem,\s*-16vw,\s*-4rem\)/,
  );

  assert.match(volunteer, /<RoleIcon size=\{30\} strokeWidth=\{1\.65\}/);
  assert.match(volunteer, /<motion\.li[\s\S]*?initial=\{false\}[\s\S]*?whileInView=\{\{ opacity: 1, x: 0 \}\}/);
  assert.doesNotMatch(volunteer, /initial=\{reducedMotion/);
  assert.match(
    volunteerCss,
    /\.volunteer-role__number\s*\{[\s\S]*?display:\s*grid[\s\S]*?place-items:\s*center[\s\S]*?text-align:\s*center/,
  );
  assert.match(
    volunteerCss,
    /\.volunteer-role\s*\{[\s\S]*?grid-template-columns:\s*4\.25rem minmax\(0,\s*1fr\) 3\.5rem[\s\S]*?align-items:\s*center/,
  );
  assert.match(
    volunteerCss,
    /\.volunteer-role__icon\s*\{[\s\S]*?width:\s*3\.25rem[\s\S]*?border-radius:\s*50%[\s\S]*?border:\s*1px solid/,
  );

  assert.doesNotMatch(footer, /Наш Telegram канал|Наша группа ВКонтакте/);
  assert.equal((footer.match(/<VKIcon/g) || []).length, 1);
  assert.match(footer, /className="space-y-2"[\s\S]*?Написать нам в ВК[\s\S]*?className="[^"]*mt-5/);
});

test("new browser annotations refine about, section backgrounds, donation spacing, and volunteering", async () => {
  const [page, about, ring, ringCss, globals, donationCss, volunteer, volunteerCss] = await Promise.all([
    read("../../app/page.tsx"),
    read("./about-section.tsx"),
    read("./rescued-ring.tsx"),
    read("./rescued-ring.css"),
    read("../../app/globals.css"),
    read("../donations/donation-experience.css"),
    read("./volunteer-section.tsx"),
    read("./volunteer-section.css"),
  ]);

  assert.doesNotMatch(about, />О нас</i);
  assert.match(about, /Array\.from\(\{ length: 30 \}/);
  assert.doesNotMatch(about, /ABOUT_RAYS|about-light-rays|about-light-ray/);
  assert.match(about, /about-light-particle/);
  assert.match(about, /about-stat__halo/);
  assert.match(globals, /\.about-stat:nth-child\(1\) \.about-stat__halo\s*\{[^}]*background:/);
  assert.match(globals, /\.about-stat:nth-child\(2\) \.about-stat__halo\s*\{[^}]*background:/);
  assert.match(globals, /\.about-stat:nth-child\(3\) \.about-stat__halo\s*\{[^}]*background:/);
  assert.match(globals, /@media \(min-width: 36rem\) and \(max-width: 53\.99rem\)[\s\S]*?\.about-stats\s*\{[\s\S]*?repeat\(2/);
  assert.match(globals, /@media \(min-width: 54rem\)[\s\S]*?\.about-stats\s*\{[\s\S]*?repeat\(3/);

  assert.match(ring, /ring-ambient__wash--amber/);
  assert.match(ring, /ring-ambient__wash--clay/);
  assert.match(ring, /style=\{\{ x: ambientAmberX/);
  assert.match(ringCss, /\.ring-ambient__canvas\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(globals, /\.pet-stories__stage\s*\{[\s\S]*?background:\s*#fff/);

  assert.match(donationCss, /@media \(max-width: 960px\)[\s\S]*?\.donation-tab-panels\s*\{[^}]*margin-top:\s*0\.5rem/);
  assert.match(donationCss, /@media \(max-width: 767px\)[\s\S]*?\.donation-pet\s*\{[\s\S]*?width:\s*min\(70vw,\s*19rem\)[\s\S]*?transform:\s*translateY\(-50%\)/);

  assert.match(page, /<VolunteerSection imageUrl=\{siteMedia\.homeAbout\}/);
  assert.match(volunteer, /Footprints/);
  assert.doesNotMatch(volunteer, /\bDog\b/);
  assert.match(volunteer, /imageUrl \|\| "\/about\/panorama\.jpg"/);
  assert.match(volunteerCss, /\.volunteer-role:first-child \.volunteer-role__icon/);
});

test("latest about and rescued feedback keeps light organic and responsive backgrounds continuous", async () => {
  const [about, globals, ringCss] = await Promise.all([
    read("./about-section.tsx"),
    read("../../app/globals.css"),
    read("./rescued-ring.css"),
  ]);

  assert.doesNotMatch(about, /ABOUT_RAYS|about-light-rays|about-light-ray/);
  assert.match(about, /about-light-particle/);
  assert.match(globals, /\.about-light-particle\s*\{[\s\S]*?background:\s*rgba\(245,\s*158,\s*11/);
  assert.match(
    globals,
    /@media \(min-width: 36rem\) and \(max-width: 53\.99rem\)[\s\S]*?\.about-stat:last-child:nth-child\(odd\)\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1[\s\S]*?justify-self:\s*center/,
  );
  assert.match(globals, /\.about-stat__portrait\s*\{[\s\S]*?inline-size:\s*clamp\(9rem/);
  assert.match(
    ringCss,
    /\.ring\s*\{[\s\S]*?background-image:\s*linear-gradient/,
  );
  assert.match(ringCss, /\.ring-ambient\s*\{[\s\S]*?overflow:\s*clip/);
});

test("large news media fills the horizontal card at tablet widths", async () => {
  const [news, newsCss] = await Promise.all([
    read("../news/news-card.tsx"),
    read("../news/news-card.css"),
  ]);

  assert.match(news, /isLarge\s*\?\s*"news-card__media--large"/);
  assert.match(
    newsCss,
    /@media \(min-width: 768px\) and \(max-width: 1023px\)[\s\S]*?\.news-card__media--large\s*\{[\s\S]*?align-self:\s*stretch[\s\S]*?height:\s*auto\s*!important[\s\S]*?min-height:\s*0\s*!important/,
  );
});

test("rescued desktop scene stays visible and reverses every scroll-driven phase", async () => {
  const ring = await read("./rescued-ring.tsx");

  assert.doesNotMatch(ring, /useInView\(exitRef,\s*\{\s*once:\s*true/);
  assert.doesNotMatch(ring, /const ringOpacity = useTransform/);
  assert.match(ring, /const ringScale = useTransform\(scrollYProgress/);
  assert.match(ring, /const ringX = useTransform\(scrollYProgress/);
  assert.match(ring, /const storyX = useTransform\(scrollYProgress/);
  assert.match(ring, /function GatheredItem\([\s\S]*?useTransform\(progress/);
  assert.match(ring, /<GatheredItem[\s\S]*?progress=\{scrollYProgress\}/);
});

test("rescued desktop follows the reference scatter to orbit to story sequence", async () => {
  const [ring, ringCss] = await Promise.all([
    read("./rescued-ring.tsx"),
    read("./rescued-ring.css"),
  ]);

  assert.match(ring, /const PORTRAIT_SCATTER\s*=\s*\[/);
  assert.match(
    ring,
    /function Portrait\([\s\S]*?progress:\s*MotionValue<number>[\s\S]*?useTransform\(progress[\s\S]*?\bx\b[\s\S]*?\by\b[\s\S]*?\bscale\b[\s\S]*?\brotate\b/,
  );
  assert.match(ring, /<Portrait[\s\S]*?progress=\{scrollYProgress\}/);
  assert.match(ring, /const titleScale = useTransform\(scrollYProgress/);

  const titlePhase = ring.indexOf("const titleScale = useTransform");
  const orbitShiftPhase = ring.indexOf("const ringScale = useTransform");
  const storyPhase = ring.indexOf("const storyX = useTransform");
  assert.ok(titlePhase >= 0 && orbitShiftPhase > titlePhase && storyPhase > orbitShiftPhase);
  assert.match(ringCss, /\.ring\s*\{[\s\S]*?min-height:\s*360vh/);
});

test("rescued ring keeps orbit motion on compact screens and scatters only on desktop", async () => {
  const ring = await read("./rescued-ring.tsx");

  assert.match(ring, /pauseOrbit:\s*boolean/);
  assert.match(ring, /scatter:\s*boolean/);
  assert.match(ring, /offsetDistance:\s*pauseOrbit\s*\?/);
  assert.match(ring, /pauseOrbit=\{still\s*\|\|\s*!ringVisible\}/);
  assert.match(ring, /scatter=\{!compact\s*&&\s*!still\s*&&\s*ringVisible\}/);
  assert.doesNotMatch(ring, /pauseOrbit=\{[^}]*compact/);
});

test("rescued desktop centers the fixed canvas and keeps only relevant objects around the story column", async () => {
  const [ring, ringCss] = await Promise.all([
    read("./rescued-ring.tsx"),
    read("./rescued-ring.css"),
  ]);

  assert.match(ringCss, /\.ring-fit\s*\{[\s\S]*?top:\s*50%[\s\S]*?translate:\s*0\s+-50%/);
  assert.match(ringCss, /\.ring-center__copy\s*\{[\s\S]*?width:\s*min\(54%,\s*32rem\)/);
  assert.match(ringCss, /\.ring-line\s*\{[\s\S]*?font-size:\s*clamp\(1\.55rem,\s*3\.8vw,\s*2\.65rem\)/);
  assert.match(ringCss, /\.ring-gather\s*\{[\s\S]*?top:\s*0[\s\S]*?height:\s*100%/);

  const gatherBlock = ring.match(/const GATHER\s*=\s*\[([\s\S]*?)\n\];/)?.[1] ?? "";
  const targetY = [...gatherBlock.matchAll(/\by:\s*(-?\d+)/g)].map((match) => Number(match[1]));
  const fallingY = [...gatherBlock.matchAll(/from:\s*\[\s*-?\d+\s*,\s*(-?\d+)/g)].map((match) => Number(match[1]));

  assert.doesNotMatch(gatherBlock, /item-(?:wet-food|blanket)/);
  assert.equal(targetY.length, 4);
  assert.ok(Math.max(...targetY) - Math.min(...targetY) >= 40);
  assert.ok(fallingY.every((value) => value < 0));
});

test("desktop donation form uses both halves of the paper panel", async () => {
  const donationCss = await read("../donations/donation-experience.css");

  assert.match(
    donationCss,
    /@media \(min-width: 1121px\)[\s\S]*?\.donation-experience__form\s*\{[\s\S]*?width:\s*100%[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.15fr\)\s+minmax\(24rem,\s*0\.85fr\)/,
  );
  assert.match(
    donationCss,
    /@media \(min-width: 1121px\)[\s\S]*?\.donation-fields\s*\{[\s\S]*?grid-column:\s*2[\s\S]*?grid-row:\s*1\s*\/\s*span\s*3/,
  );
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("donation experience uses semantic controls and has no fake payment", async () => {
  const [payment, experience, picker, fields, feed, campaignForm, css] = await Promise.all([
    read("../sections/payment-section.tsx"),
    read("./donation-experience.tsx"),
    read("./donation-tier-picker.tsx"),
    read("./donation-fields.tsx"),
    read("./donation-feed.tsx"),
    read("../campaigns/campaign-donate-form.tsx"),
    read("./donation-experience.css"),
  ]);
  const allDonationSource = [payment, experience, picker, fields, feed, campaignForm].join("\n");

  assert.doesNotMatch(allDonationSource, /alert\s*\(/);
  assert.doesNotMatch(allDonationSource, /setTimeout\s*\(/);
  assert.doesNotMatch(allDonationSource, /прямо сейчас/i);
  assert.doesNotMatch(allDonationSource, /CloudPayments/i);
  assert.doesNotMatch(allDonationSource, /canvas-confetti/);
  assert.doesNotMatch(allDonationSource, /isSuccess/);
  assert.match(payment, /<DonationExperience feed=\{feed\}/);
  assert.match(experience, /<form className="donation-experience__form"/);
  assert.match(experience, /donation-experience__vow/);
  assert.match(experience, /role="tablist"/);
  assert.match(experience, /role="tab"/);
  assert.match(experience, /role="tabpanel"/);
  assert.match(experience, /aria-selected=\{activeTab === "help"\}/);
  assert.match(experience, /onKeyDown=\{handleTabKeyDown\}/);
  assert.match(experience, /donation-tab-panel--feed/);
  assert.match(experience, /HeartHandshake/);
  assert.match(experience, /UsersRound/);
  assert.match(experience, /DonationPet/);
  assert.match(experience, /Помощники/);
  assert.doesNotMatch(payment, /Государственного финансирования/);
  assert.doesNotMatch(experience, /Фонд «Легкий Яр»/);
  assert.ok(
    experience.indexOf('className="donation-experience__panel"') < experience.indexOf('className="donation-tabs"'),
    "the tab switcher must sit inside the shared donation surface",
  );
  assert.ok(
    experience.indexOf('className="donation-tabs"') < experience.indexOf('id="donation-panel-help"'),
    "the switcher must stay above both tab panels",
  );
  assert.equal((experience.match(/<DonationPet/g) ?? []).length, 1, "the shared dog renders once");
  assert.ok(
    experience.indexOf("<DonationPet") < experience.indexOf('className="donation-tab-panels"'),
    "the dog must remain outside both switchable panels",
  );
  assert.doesNotMatch(experience, /(?:^|\s)hidden=\{activeTab/);
  assert.match(experience, /data-active=\{activeTab === "help"\}/);
  assert.match(experience, /data-active=\{activeTab === "feed"\}/);
  assert.match(experience, /inert=\{activeTab !== "help"\}/);
  assert.match(experience, /inert=\{activeTab !== "feed"\}/);
  assert.match(experience, /const \[donorName, setDonorName\]/);
  assert.match(experience, /const \[email, setEmail\]/);
  assert.match(experience, /const \[anonymous, setAnonymous\]/);
  assert.match(experience, /const \[consent, setConsent\]/);
  assert.ok(
    experience.indexOf("</form>") < experience.indexOf("<DonationFeed"),
    "the help feed must stay outside the contribution form",
  );
  assert.match(picker, /<fieldset/);
  assert.match(picker, /<legend/);
  assert.match(picker, /type="radio"/);
  for (const icon of ["Bone", "Bandage", "Stethoscope", "HeartPulse", "ArrowRight"]) {
    assert.match(picker, new RegExp(icon));
  }
  assert.match(picker, /donation-tier--custom/);
  assert.match(picker, /const inputId = useId\(\)/);
  assert.ok(picker.includes('id={`${inputId}-custom-amount`}'));
  assert.ok(picker.includes('htmlFor={`${inputId}-custom-amount`}'));
  assert.match(picker, /type="number"/);
  assert.match(picker, /Другая сумма/);
  assert.ok(
    picker.indexOf("{TIERS.map") < picker.indexOf('donation-tier donation-tier--custom'),
    "the custom amount card must remain after every preset tier",
  );
  assert.doesNotMatch(picker, /donation-tier__number|padStart/);
  assert.match(fields, /<label/);
  assert.match(fields, /CalendarHeart/);
  assert.match(fields, /HandCoins/);
  assert.match(fields, /data-cadence="monthly"/);
  assert.match(fields, /data-cadence="once"/);
  assert.match(fields, /HeartHandshake/);
  assert.match(fields, /Опека/);
  assert.match(fields, /каждый месяц/);
  assert.match(fields, /Разовая помощь/);
  assert.doesNotMatch(fields, /один раз/);
  assert.ok(fields.includes('id={`${inputId}-name`}'));
  assert.ok(fields.includes('htmlFor={`${inputId}-name`}'));
  assert.match(fields, /autoComplete="name"/);
  assert.ok(fields.includes('id={`${inputId}-email`}'));
  assert.ok(fields.includes('htmlFor={`${inputId}-email`}'));
  assert.match(fields, /autoComplete="email"/);
  assert.match(fields, /name="anonymous"/);
  assert.match(fields, /Анонимная помощь/);
  assert.match(fields, /name="consent"/);
  assert.match(fields, /href="\/privacy"/);
  assert.match(fields, /Согласен с .*обработкой персональных данных/);
  assert.match(fields, /donation-anonymous-toggle/);
  assert.match(fields, /\{!anonymous\s*&&\s*\(/);
  assert.doesNotMatch(fields, /disabled=\{anonymous\}/);
  assert.match(fields, /disabled/);
  assert.match(fields, /aria-disabled="true"/);
  assert.match(fields, /Онлайн-оплата подключается/);
  assert.match(fields, /donation-fields__person/);
  assert.match(css, /\.donation-provider-button\s*\{[\s\S]*?width:\s*fit-content/);
  assert.match(css, /\.donation-provider-button\s*\{[\s\S]*?margin-inline:\s*auto/);
  assert.match(css, /\.donation-provider-button::before\s*\{[\s\S]*?animation:\s*donation-button-shimmer/);
  assert.match(css, /\.donation-tier--custom\s*\{[\s\S]*?grid-template-columns:\s*auto\s+minmax\(0,\s*1fr\)/);
  assert.match(css, /\.donation-tier__custom-control\s*\{[\s\S]*?grid-column:\s*2/);
  assert.match(css, /\.donation-anonymous-toggle__track/);
  assert.match(css, /@media \(max-width: 1120px\)[\s\S]*?\.donation-pet\s*\{[\s\S]*?position:\s*absolute[\s\S]*?top:\s*0/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.donation-pet\s*\{[\s\S]*?position:\s*absolute[\s\S]*?top:\s*0/);
  assert.match(css, /\.donation-tabs button:hover/);
  assert.match(css, /\.donation-tabs button:active/);
  assert.match(css, /\.donation-tabs button:focus-visible/);
  assert.match(css, /\.donation-tabs\s*\{[\s\S]*?margin:\s*clamp\([^;]+\)\s+auto\s+0/);
  assert.match(css, /\.donation-tab-panels\s*\{[\s\S]*?display:\s*grid/);
  assert.match(css, /\.donation-tab-panel\s*\{[\s\S]*?grid-area:\s*1\s*\/\s*1[\s\S]*?opacity:\s*0[\s\S]*?visibility:\s*hidden/);
  assert.match(css, /\.donation-tab-panel\[data-active="true"\]\s*\{[\s\S]*?opacity:\s*1[\s\S]*?visibility:\s*visible/);
  assert.doesNotMatch(css, /\.donation-tab-panel\[hidden\]/);
  assert.doesNotMatch(css, /donation-pet__stage::before|donation-pet__stage::after|%3Crect x='39'|%3Crect x='16'/);
  assert.match(feed, /status === "ready"/);
  assert.match(feed, /status === "empty"/);
  assert.match(feed, /status === "unavailable"/);
  assert.match(feed, /data-lenis-prevent/);
  assert.match(feed, /Помощники/);
  for (const icon of ["Heart", "PawPrint", "Sparkles", "Star", "Sun", "Flower2", "HandHeart", "Leaf", "Smile", "Gift"]) {
    assert.match(feed, new RegExp(icon));
  }
  for (const removedIcon of ["Rainbow", "Clover", "Bird", "ShieldCheck", "MoonStar", "Gem", "Crown", "PartyPopper", "Feather", "Rabbit"]) {
    assert.doesNotMatch(feed, new RegExp(removedIcon));
  }
  assert.match(feed, /donation-feed__heading-icon/);
  assert.match(feed, /Люди, которые/);
  assert.match(feed, /<em>рядом<\/em>/);
  assert.doesNotMatch(feed, /Разовая помощь · один раз/);
  assert.doesNotMatch(experience, /feed\.items\.length\s*>\s*0\s*&&/);
});

test("Serkan mood assets have one stable public contract", async () => {
  const pet = await read("./donation-pet.tsx");
  for (const mood of ["worried", "cautious", "relieved", "trusting"]) {
    assert.ok(pet.includes(`/donate/serkan/${mood}.webp`));
  }
  assert.doesNotMatch(pet, /donation-pet__caption|donation-pet__name/);
  assert.doesNotMatch(pet, /role="status"|aria-live/);
});

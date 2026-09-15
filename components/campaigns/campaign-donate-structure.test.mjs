import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

/* Окно помощи на странице сборов ломалось дважды, и оба раза тихо: первый раз
   прокруткой, второй раз раскладкой полей. Браузерная приёмка это ловит
   (scripts/check-campaigns-collage.mjs), но она требует поднятого сервера и
   минут, поэтому самые дорогие условия закреплены здесь, по исходникам. */

test("campaign donate dialog keeps its scroll, its motion and the shared donation form", async () => {
  const [dialog, form, css] = await Promise.all([
    read("./campaign-donate-dialog.tsx"),
    read("./campaign-donate-form.tsx"),
    read("./campaigns.css"),
  ]);

  /* Прокрутка. Lenis перехватывает колесо на всём документе, и без этой
     пометки содержимое окна не прокручивается вовсе: полоса есть, колесо не
     работает. Одного lenis.stop() мало — он останавливает страницу, но
     события всё равно съедаются. Разбор в docs/development-standards.md. */
  assert.match(dialog, /className="camp-donate__body" data-lenis-prevent/);
  assert.match(css, /\.camp-donate__body\s*\{[\s\S]*?overflow-y:\s*auto/);
  assert.match(dialog, /lenis\?\.stop\(\)/);
  assert.match(dialog, /document\.body\.style\.overflow = "hidden"/);

  /* Лист снизу на узком экране, окно по центру на широком, и уход анимирован:
     без AnimatePresence узел исчезал бы мгновенно. */
  assert.match(dialog, /AnimatePresence/);
  assert.match(dialog, /useSheet\(/);
  assert.match(dialog, /max-width:\s*860px/);
  assert.match(dialog, /exit: \{ y: "100%" \}/);
  assert.match(dialog, /useReducedMotion/);

  /* Ступени и поля берутся с главной, а не переписаны заново: иначе суммы и
     подписи разойдутся на первой же правке. Лист стилей форма подключает
     сама — панели главной, которая его тянула, здесь нет. */
  assert.match(form, /from "@\/components\/donations\/donation-fields"/);
  assert.match(form, /from "@\/components\/donations\/donation-tier-picker"/);
  assert.match(form, /import "@\/components\/donations\/donation-experience\.css"/);
  assert.match(form, /<DonationTierPicker/);
  assert.match(form, /<DonationFields/);
  assert.match(form, /getDonationTier\(amount\)/);
  // Суммы приходят из общего списка, своих чисел в форме нет.
  assert.doesNotMatch(form, /\b(?:300|1000|3000)\b/);

  /* Обвязки панели в окне быть не должно: владелец отклонил и вкладки, и
     подопечного над верхней кромкой. */
  assert.doesNotMatch(form, /DonationPet|DonationFeed|role="tablist"/);
  assert.doesNotMatch(dialog, /DonationPet|DonationExperience/);

  /* Раскладка панели переопределена и в окне, и в форме на самой странице
     сбора: одна колонка вместо второй, карточки вместо ленты со снапом. */
  assert.match(
    css,
    /\.camp-donate__body \.donation-tier-picker,[\s\S]{0,120}\.donation-fields\s*\{[\s\S]*?grid-column:\s*auto;[\s\S]*?grid-row:\s*auto/,
  );
  const tierList = css.match(/\.camp-donate__body \.donation-tier-picker__list,[\s\S]{0,80}\{([\s\S]*?)\}/);
  assert.ok(tierList, "в окне нет переопределения списка ступеней");
  assert.match(css, /\.fund-form \.donation-tier-picker__list/);
  for (const rule of [
    /grid-auto-flow:\s*row/,
    // Карточками в две колонки, как в форме на главной.
    /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/,
    /overflow-x:\s*visible/,
    /scroll-snap-type:\s*none/,
  ]) {
    assert.match(tierList[1], rule);
  }
  // На телефоне колонка остаётся одна: в половину ширины сумма не влезает.
  assert.match(
    css,
    /@media \(max-width: 560px\)\s*\{[\s\S]{0,200}\.donation-tier-picker__list[\s\S]{0,120}grid-template-columns:\s*1fr/,
  );
  assert.match(
    css,
    /\.camp-donate__body \.donation-fields__person,[\s\S]{0,80}\{[\s\S]{0,80}grid-template-columns:\s*1fr/,
  );

  /* Ряд управления каталога: вкладки и список сортировки одной высоты. Список
     общий с каталогом питомцев и приносит свою, на 13 пикселей меньше. */
  assert.match(css, /--camp-control-h:\s*52px/);
  assert.match(css, /\.camp-tabs\s*\{[\s\S]*?min-height:\s*var\(--camp-control-h\)/);
  assert.match(css, /\.camp-sort > div > button\s*\{\s*min-height:\s*var\(--camp-control-h\)/);
});

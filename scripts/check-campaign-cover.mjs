import assert from "node:assert/strict";
import { chromium } from "playwright-core";

/**
 * Контракт на обложку страницы сборов, секция 1 плана «Сквозь вещи».
 *
 * Скриншот показывает один кадр и молчит о том, когда этот кадр наступает,
 * поэтому ход сцены снимается замером: прокрутка ставится в несколько точек
 * пути обложки мимо экрана, и на каждой считывается ход передних гроздей. Хороший
 * вывод это ряд, а не ступенька.
 *
 * Запуск: node scripts/check-campaign-cover.mjs [baseUrl] [имя ширины]
 */

const baseUrl = process.argv[2] || "http://localhost:3000";
const filter = process.argv[3];

const allViewports = [
  { name: "desktop", width: 1440, height: 900 },
  // Высокое окно проверяется отдельно: чем выше экран, тем дольше обложка
  // остаётся целиком в кадре, и тем позже начинается отрезок exit.
  { name: "desktop-tall", width: 1440, height: 1200 },
  { name: "desktop-wide", width: 1920, height: 1080 },
  { name: "laptop", width: 1024, height: 800 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 700 },
  { name: "reduced-motion", width: 1440, height: 900, reducedMotion: "reduce" },
];

const viewports = filter ? allViewports.filter((v) => v.name === filter) : allViewports;
assert.ok(viewports.length > 0, `неизвестная ширина: ${filter}`);

/** Доли пути обложки мимо экрана, в которых снимается состояние сцены. */
const STOPS = [0, 0.2, 0.35, 0.45, 0.55, 0.65, 0.75, 0.9, 1];

/**
 * Ход сцены: прогресс читается у самой анимации, а не разбором стиля.
 *
 * Читается дважды с паузой и берётся большее. Анимация на шкале прокрутки
 * успевает побывать в состоянии pending сразу после перемотки, и в этот
 * момент `progress` приходит пустым. Одиночный замер ловил такой кадр и
 * показывал ноль посреди ровного ряда.
 */
async function progress(page) {
  const read = () =>
    page.$eval(".camp-cover__near--left", (node) => {
      const animation = node.getAnimations()[0];
      if (!animation) return -1;
      const value = animation.effect.getComputedTiming().progress;
      return value === null || value === undefined ? null : Math.round(value * 100);
    });

  const first = await read();
  await page.waitForTimeout(140);
  const second = await read();

  if (first === null) return second ?? -1;
  if (second === null) return first;
  return Math.max(first, second);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
let failed = false;

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: viewport.reducedMotion || "no-preference",
    });
    const page = await context.newPage();
    const errors = [];
    const badResponses = [];

    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().startsWith(baseUrl)) {
        badResponses.push(`${response.status()} ${new URL(response.url()).pathname}`);
      }
    });

    await page.goto(`${baseUrl}/campaigns`, { waitUntil: "load", timeout: 90_000 });
    await page.locator(".camp-cover").waitFor({ state: "visible" });
    await page.waitForFunction(
      () => [...document.querySelectorAll(".camp-cover img")].every((img) => img.complete),
      null,
      { timeout: 30_000 },
    );

    const layers = await page.evaluate(() => ({
      yard: document.querySelectorAll(".camp-cover__yard").length,
      pet: document.querySelectorAll(".camp-cover__pet").length,
      near: document.querySelectorAll(".camp-cover__near").length,
      veil: document.querySelectorAll(".camp-cover__veil").length,
      heading: document.querySelector(".camp-cover h1")?.innerText.replace(/\s+/g, " ").trim(),
      cta: document.querySelector(".camp-cover__cta")?.textContent.trim(),
    }));

    assert.equal(layers.yard, 1, `${viewport.name}: слой двора не один`);
    assert.equal(layers.pet, 1, `${viewport.name}: слой подопечного не один`);
    assert.equal(layers.near, 2, `${viewport.name}: передних гроздей не две`);
    assert.equal(layers.veil, 1, `${viewport.name}: кремовой вуали нет`);
    assert.match(layers.heading, /Открытые/, `${viewport.name}: заголовок обложки потерялся`);

    const geometry = await page.evaluate(() => {
      const box = document.querySelector(".camp-cover").getBoundingClientRect();
      return {
        top: Math.round(box.top + window.scrollY),
        height: Math.round(box.height),
        viewport: window.innerHeight,
        max: Math.round(document.documentElement.scrollHeight - window.innerHeight),
      };
    });

    // Обложка занимает около 60svh и не съедает первый экран целиком:
    // карточки сборов обязаны начинаться сразу под сгибом.
    const share = geometry.height / geometry.viewport;
    assert.ok(share <= 0.9, `${viewport.name}: обложка съела ${Math.round(share * 100)}% экрана`);

    /* Обложка стоит первой на странице, поэтому её сцена сидит на отрезке
       exit: он начинается, когда читатель тронул колесо, и кончается, когда
       полоса уходит за верхнюю кромку. Пробы ставятся по этому пути, от нуля
       прокрутки до момента, когда низ полосы прошёл верх экрана. */
    const path = geometry.top + geometry.height;

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(overflow <= 1, `${viewport.name}: перелив по горизонтали ${overflow}px`);

    // Заголовок читается на фотографии: вуаль обязана лежать под ним.
    const veilAtHeading = await page.evaluate(() => {
      const heading = document.querySelector(".camp-cover h1").getBoundingClientRect();
      const veil = document.querySelector(".camp-cover__veil").getBoundingClientRect();
      return veil.left <= heading.left && veil.right >= heading.right && veil.top <= heading.top;
    });
    assert.ok(veilAtHeading, `${viewport.name}: заголовок вышел за вуаль`);

    const row = [];
    for (const stop of STOPS) {
      const target = Math.max(0, Math.min(geometry.max, Math.round(stop * path)));

      /* Прокрутка проверяется, а не ставится вслепую. В режиме разработки
         страница может пересобраться прямо во время замера, и тогда браузер
         возвращает прокрутку в ноль. Одиночная установка ловила такой кадр,
         и посреди ровного ряда появлялся ноль. */
      let landed = -1;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await page.evaluate((y) => window.scrollTo(0, y), target);
        await page.waitForTimeout(200);
        landed = await page.evaluate(() => Math.round(window.scrollY));
        if (Math.abs(landed - target) <= 2) break;
      }
      assert.ok(
        Math.abs(landed - target) <= 2,
        `${viewport.name}: прокрутка не встала на ${target}px, осталась на ${landed}px`,
      );

      row.push({ stop, value: await progress(page) });
    }

    const line = row.map((point) => `${Math.round(point.stop * 100)}%:${point.value}`).join("  ");
    console.log(`${viewport.name.padEnd(15)} высота ${geometry.height}px, ${Math.round(share * 100)}% экрана`);
    console.log(`${" ".repeat(16)}${line}`);

    if (viewport.reducedMotion === "reduce") {
      // Гашение движения показывает итог: вещи разведены, а не сведены.
      const parted = await page.evaluate(() => {
        const left = document.querySelector(".camp-cover__near--left");
        const style = getComputedStyle(left);
        return { animation: style.animationName, translate: style.translate };
      });
      assert.equal(parted.animation, "none", "reduced motion: анимация обложки не погашена");
      assert.ok(
        parted.translate.startsWith("-"),
        `reduced motion: вещи остались сведёнными (${parted.translate})`,
      );
      console.log(`${" ".repeat(16)}гашение: вещи разведены на ${parted.translate}`);
    } else {
      const values = row.map((point) => point.value);
      assert.equal(values[0], 0, `${viewport.name}: сцена уже отыграла на входе в отрезок`);
      assert.equal(values[values.length - 1], 100, `${viewport.name}: сцена не доиграла до конца`);
      const distinct = new Set(values).size;
      assert.ok(distinct >= 5, `${viewport.name}: ход идёт ступенькой, различных состояний ${distinct}`);
      for (let i = 1; i < values.length; i += 1) {
        assert.ok(values[i] >= values[i - 1], `${viewport.name}: ход пошёл назад на ${STOPS[i]}`);
      }
    }

    assert.deepEqual(errors, [], `${viewport.name}: ошибки в консоли`);
    assert.deepEqual(badResponses, [], `${viewport.name}: неудачные запросы`);

    await context.close();
  }
} catch (error) {
  failed = true;
  console.error(String(error.message || error));
} finally {
  await browser.close();
}

process.exit(failed ? 1 : 0);

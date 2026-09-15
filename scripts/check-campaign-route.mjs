import assert from "node:assert/strict";
import { chromium } from "playwright-core";

/**
 * Контракт на секцию 3 страницы сборов: ленту «Куда уходит взнос».
 *
 * Скриншот показывает один кадр и молчит о том, когда этот кадр наступает,
 * поэтому ход сцены снимается замером: прокрутка ставится в несколько точек
 * пути секции, и на каждой считывается сдвиг ленты и число зажжённых подписей.
 * Хороший вывод это ряд, а не ступенька.
 *
 * Запуск: node scripts/check-campaign-route.mjs [baseUrl] [имя ширины]
 */

const baseUrl = process.argv[2] || "http://localhost:3000";
const filter = process.argv[3];

const allViewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "desktop-tall", width: 1440, height: 1200 },
  { name: "laptop", width: 1024, height: 800 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 700 },
  { name: "reduced-motion", width: 1440, height: 900, reducedMotion: "reduce" },
];

const viewports = filter ? allViewports.filter((v) => v.name === filter) : allViewports;
assert.ok(viewports.length > 0, `неизвестная ширина: ${filter}`);

/** Доли пути секции мимо экрана, в которых снимается состояние сцены. */
const STOPS = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];

/**
 * Состояние сцены: сдвиг ленты в пикселях и сколько подписей зажжено.
 *
 * Сдвиг читается из матрицы преобразования, а не из инлайнового стиля:
 * framer пишет туда сокращённую запись, и разбор строкой врёт.
 */
const state = (page) =>
  page.evaluate(() => {
    const strip = document.querySelector(".camp-route__strip");
    const style = getComputedStyle(strip);
    const matrix = new DOMMatrixReadOnly(style.translate === "none" ? style.transform : `translate(${style.translate})`);
    const lit = [...document.querySelectorAll(".camp-route__station")].filter(
      (node) => Number(getComputedStyle(node).opacity) > 0.9,
    ).length;
    return { x: Math.round(matrix.m41), lit };
  });

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
    await page.locator(".camp-route").waitFor({ state: "attached" });
    /* Картинок ленты не ждём: они отложенные и до прокрутки не грузятся,
       а коробки им задаёт CSS, поэтому раскладка от них не зависит. */
    await page.waitForTimeout(500);

    const shape = await page.evaluate(() => {
      const section = document.querySelector(".camp-route");
      const track = document.querySelector(".camp-route__track");
      const strip = document.querySelector(".camp-route__strip");
      const box = section.getBoundingClientRect();
      return {
        top: Math.round(box.top + window.scrollY),
        height: Math.round(box.height),
        viewport: window.innerHeight,
        max: Math.round(document.documentElement.scrollHeight - window.innerHeight),
        trackWidth: Math.round(track.clientWidth),
        stripWidth: Math.round(strip.scrollWidth),
        stations: document.querySelectorAll(".camp-route__station").length,
        heading: document.querySelector("#camp-route-title")?.innerText.replace(/\s+/g, " ").trim(),
      };
    });

    assert.ok(shape.stations >= 1, `${viewport.name}: подписей станций нет вовсе`);
    assert.match(shape.heading, /доезжают/, `${viewport.name}: заголовок секции потерялся`);

    /* Лента обязана быть длиннее окна, иначе ехать некуда и сцены нет.
       Пропорция картины шесть к одному, и это проверяемое утверждение. */
    const ratio = shape.stripWidth / shape.trackWidth;
    assert.ok(ratio > 1.4, `${viewport.name}: лента короче полутора окон, ехать некуда (${ratio.toFixed(2)})`);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(overflow <= 1, `${viewport.name}: перелив по горизонтали ${overflow}px`);

    /* Пробы ставятся по окну самой сцены, а не по всей странице.
       На широком экране лента едет, пока секция держит экран целиком: от
       того места, где её верх дошёл до верха окна, до того, где её низ дошёл
       до низа окна. На узком экране секция ниже экрана, и окном служит её
       проход мимо него. Проба по всей странице ловила три точки из восьми и
       называла ровный ход ступенькой. */
    const pinned = shape.top + shape.height - shape.viewport;
    const start = pinned > shape.top ? shape.top - 60 : shape.top - shape.viewport;
    const end = pinned > shape.top ? pinned + 60 : shape.top + shape.height;

    const row = [];
    for (const stop of STOPS) {
      const target = Math.max(0, Math.min(shape.max, Math.round(start + stop * (end - start))));

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

      row.push({ stop, ...(await state(page)) });
    }

    const line = row.map((point) => `${Math.round(point.stop * 100)}%:${point.x}/${point.lit}`).join("  ");
    console.log(
      `${viewport.name.padEnd(15)} лента ${shape.stripWidth}px в окне ${shape.trackWidth}px, станций ${shape.stations}`,
    );
    console.log(`${" ".repeat(16)}${line}`);

    if (viewport.reducedMotion === "reduce") {
      // Гашение движения показывает итог: лента стоит, подписи все зажжены,
      // свет над лентой горит, а пролистать её можно рукой.
      const settled = await page.evaluate(() => {
        const track = document.querySelector(".camp-route__track");
        const sticky = document.querySelector(".camp-route__sticky");
        return {
          overflowX: getComputedStyle(track).overflowX,
          position: getComputedStyle(sticky).position,
          glow: Number(getComputedStyle(document.querySelector(".camp-route__glow")).opacity),
        };
      });
      assert.equal(settled.position, "static", "reduced motion: сцена всё ещё липнет");
      assert.equal(settled.overflowX, "auto", "reduced motion: ленту нельзя пролистать рукой");
      assert.ok(settled.glow > 0.9, "reduced motion: свет над лентой не зажёгся");
      assert.equal(
        row.filter((point) => point.lit < shape.stations).length,
        0,
        "reduced motion: подписи станций зажжены не все",
      );
      console.log(`${" ".repeat(16)}гашение: подписей ${shape.stations}, свет ${settled.glow}`);
    } else {
      const shift = row.map((point) => point.x);
      const lit = row.map((point) => point.lit);

      assert.equal(shift[0], 0, `${viewport.name}: лента уже уехала на входе в секцию`);
      assert.ok(
        shift[shift.length - 1] <= -(shape.stripWidth - shape.trackWidth) + 2,
        `${viewport.name}: лента не доехала до конца (${shift[shift.length - 1]}px)`,
      );

      const distinct = new Set(shift).size;
      assert.ok(distinct >= 5, `${viewport.name}: лента едет ступенькой, различных положений ${distinct}`);
      for (let i = 1; i < shift.length; i += 1) {
        assert.ok(shift[i] <= shift[i - 1] + 1, `${viewport.name}: лента поехала назад на ${STOPS[i]}`);
        assert.ok(lit[i] >= lit[i - 1], `${viewport.name}: подпись погасла на ${STOPS[i]}`);
      }
      assert.equal(lit[0], 0, `${viewport.name}: подписи зажжены до начала пути`);
      assert.equal(lit[lit.length - 1], shape.stations, `${viewport.name}: зажглись не все подписи`);
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

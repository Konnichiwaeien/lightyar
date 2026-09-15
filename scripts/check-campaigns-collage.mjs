import assert from "node:assert/strict";
import { chromium } from "playwright-core";

/**
 * Контракт на три коллажные секции страницы сборов: обложку, «Куда уходит
 * взнос» и финальный призыв.
 *
 * Проверяется не красота, а грамматика, которую подтвердил владелец: плоское
 * поле своего цвета у каждой секции, вырезки лежат поверх него, геометрические
 * фигуры за ними, главная вырезка переходит через шов в следующее поле, слои
 * плывут по прокрутке с разной скоростью.
 *
 * Скриншот показывает один кадр и молчит о том, когда этот кадр наступает,
 * поэтому дрейф снимается замером в нескольких точках. Хороший вывод это ряд,
 * а не ступенька.
 *
 * Запуск: node scripts/check-campaigns-collage.mjs [baseUrl] [имя ширины]
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

/** Доли пути секции мимо экрана, в которых снимается дрейф. */
const STOPS = [0, 0.25, 0.5, 0.75, 1];

/** Сдвиг слоя по вертикали. framer пишет его в transform, а не в translate. */
const shift = (page, selector) =>
  page.$$eval(selector, (nodes) =>
    nodes.map((node) => Math.round(new DOMMatrixReadOnly(getComputedStyle(node).transform).m42)),
  );

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
    await page.waitForTimeout(500);

    const shape = await page.evaluate(() => {
      const paint = (selector) => getComputedStyle(document.querySelector(selector)).backgroundColor;
      /* Выход за кромку меряется по раскладке, а не по экранным коробкам:
         слои коллажа сдвинуты трансформацией дрейфа, и в момент замера она
         прибавляет к позиции до трёх десятков пикселей. По offsetTop дрейфа
         не видно, а видно именно то, что задано в стилях. */
      const coverField = document.querySelector(".camp-cover__field");
      const pets = [...document.querySelectorAll(".camp-cover__pet")].map((node) =>
        Math.round(node.offsetTop + node.offsetHeight - coverField.offsetHeight),
      );
      const bowl = document.querySelector(".camp-call__bowl");
      return {
        coverPaint: paint(".camp-cover"),
        routePaint: paint(".camp-route"),
        callPaint: paint(".camp-call"),
        sheetPaint: paint(".camp"),
        callBleed: -Math.round(bowl.offsetTop),
        ownCard: document.querySelectorAll(".camp-grid__own, .camp-card--own").length,
        pets: document.querySelectorAll(".camp-cover__pet").length,
        discs: document.querySelectorAll(".camp-cover__disc, .camp-route__disc").length,
        dots: document.querySelectorAll(".camp-cover__dots, .camp-route__dots").length,
        needs: document.querySelectorAll(".camp-route__need").length,
        sums: [...document.querySelectorAll(".camp-route__need b")].map((n) => n.textContent.trim()),
        bleed: Math.max(...pets),
        plate: getComputedStyle(document.querySelector(".camp-cover h1 em")).backgroundColor,
      };
    });

    /* Поле у каждой секции своё, и это часть языка, а не украшение: в
       референсах цвет меняется от секции к секции. */
    assert.notEqual(shape.coverPaint, shape.routePaint, `${viewport.name}: поля секций одного цвета`);
    assert.notEqual(shape.coverPaint, shape.sheetPaint, `${viewport.name}: обложка не отличается от листа`);
    assert.notEqual(shape.routePaint, shape.callPaint, `${viewport.name}: финал не отличается от предыдущего поля`);

    // Миска висит над верхней кромкой финала и заходит на предыдущее поле.
    assert.ok(shape.callBleed > 4, `${viewport.name}: миска не переходит через шов (${shape.callBleed}px)`);

    /* Янтарная карточка «Просто помочь» снята: финальная секция говорит ровно
       это же, и держать обе означало сказать одно дважды. */
    assert.equal(shape.ownCard, 0, `${viewport.name}: дублирующая карточка «Просто помочь» вернулась`);

    assert.ok(shape.pets >= 2, `${viewport.name}: вырезок на обложке ${shape.pets}, ожидалось хотя бы две`);
    assert.ok(shape.discs >= 2, `${viewport.name}: кругов ${shape.discs}, по одному на секцию`);
    assert.ok(shape.dots >= 2, `${viewport.name}: сеток точек ${shape.dots}, по одной на секцию`);
    assert.ok(shape.needs >= 1, `${viewport.name}: нужд на поле нет вовсе`);
    assert.ok(
      shape.sums.every((sum) => /\d/.test(sum)),
      `${viewport.name}: у нужды пропала сумма`,
    );

    // Прямоугольных фотоблоков в сценах быть не должно: за них отклонены семь
    // предыдущих заходов.
    const slabs = await page.evaluate(
      () => document.querySelectorAll(".camp-cover__yard, .camp-cover__veil, .camp-route__strip").length,
    );
    assert.equal(slabs, 0, `${viewport.name}: в сцене осталась прямоугольная фотополоса`);

    // Главная вырезка уходит за нижнюю кромку обложки и ложится на следующее
    // поле. Это тот самый переход через шов.
    if (viewport.width > 860) {
      assert.ok(shape.bleed > 4, `${viewport.name}: вырезка не переходит через шов (${shape.bleed}px)`);
    }

    assert.notEqual(shape.plate, "rgba(0, 0, 0, 0)", `${viewport.name}: плашка под словом пропала`);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(overflow <= 1, `${viewport.name}: перелив по горизонтали ${overflow}px`);

    const route = await page.evaluate(() => {
      const box = document.querySelector(".camp-route").getBoundingClientRect();
      return {
        top: Math.round(box.top + window.scrollY),
        height: Math.round(box.height),
        viewport: window.innerHeight,
        max: Math.round(document.documentElement.scrollHeight - window.innerHeight),
      };
    });

    const row = [];
    for (const stop of STOPS) {
      const target = Math.max(
        0,
        Math.min(route.max, Math.round(route.top - route.viewport + stop * (route.height + route.viewport))),
      );

      let landed = -1;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await page.evaluate((y) => window.scrollTo(0, y), target);
        await page.waitForTimeout(220);
        landed = await page.evaluate(() => Math.round(window.scrollY));
        if (Math.abs(landed - target) <= 2) break;
      }
      assert.ok(
        Math.abs(landed - target) <= 2,
        `${viewport.name}: прокрутка не встала на ${target}px, осталась на ${landed}px`,
      );

      row.push({ stop, needs: await shift(page, ".camp-route__need") });
    }

    const line = row
      .map((point) => `${Math.round(point.stop * 100)}%:${point.needs.join("/")}`)
      .join("  ");
    console.log(
      `${viewport.name.padEnd(15)} поля ${shape.coverPaint} и ${shape.routePaint}, вырезок ${shape.pets}, нужд ${shape.needs}`,
    );
    console.log(`${" ".repeat(16)}${line}`);

    if (viewport.reducedMotion === "reduce") {
      // Гашение движения: слои стоят на местах, дрейфа нет.
      const moved = row.flatMap((point) => point.needs).filter((value) => value !== 0);
      assert.deepEqual(moved, [], "reduced motion: слои коллажа всё ещё плывут");
      console.log(`${" ".repeat(16)}гашение: дрейфа нет`);
    } else {
      const first = row[0].needs;
      const last = row[row.length - 1].needs;

      // Слои плывут и плывут по-разному: одинаковая скорость это не коллаж,
      // а одна картинка, которую подвинули целиком.
      assert.ok(
        first.some((value, index) => value !== last[index]),
        `${viewport.name}: слои не сдвинулись за весь проход`,
      );
      assert.ok(
        new Set(last).size > 1,
        `${viewport.name}: все слои уехали на одно и то же, глубины нет`,
      );

      for (let i = 1; i < row.length; i += 1) {
        for (let n = 0; n < row[i].needs.length; n += 1) {
          assert.ok(
            row[i].needs[n] <= row[i - 1].needs[n] + 1,
            `${viewport.name}: слой ${n} поехал назад на ${STOPS[i]}`,
          );
        }
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

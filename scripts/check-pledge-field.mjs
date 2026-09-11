import assert from "node:assert/strict";
import { chromium } from "playwright-core";

/**
 * Контракт на сцену страницы сборов: поле взносов.
 *
 * Скриншот показывает один кадр и молчит о том, когда этот кадр наступает,
 * поэтому ход сцены снимается замером: прокрутка ставится в несколько точек
 * отрезка cover, и на каждой считается, сколько меток уже село. Хороший вывод
 * это ряд, а не ступенька.
 *
 * Запуск: node scripts/check-pledge-field.mjs [baseUrl] [имя ширины]
 */

const baseUrl = process.argv[2] || "http://localhost:3000";
const filter = process.argv[3];

const allViewports = [
  { name: "desktop", width: 1440, height: 900 },
  // Высокое окно самое опасное: чем выше экран, тем больше отрезка cover
  // пройдено уже на загрузке, и сцена рискует отыграть до первой прокрутки.
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

/** Доли отрезка cover, в которых снимается состояние сцены. */
const STOPS = [0, 0.2, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82, 0.95];

/** Сколько меток село: прогресс читается у самой анимации, а не у стиля. */
const landedCount = (page) =>
  page.$$eval("[data-got]", (nodes) =>
    nodes.filter((node) => {
      const animation = node.getAnimations()[0];
      if (!animation) return true;
      return (animation.effect.getComputedTiming().progress ?? 0) >= 0.999;
    }).length,
  );

const frame = (page) =>
  page.evaluate(() => {
    const section = document.querySelector(".camp-pledges");
    const box = section.getBoundingClientRect();
    return {
      top: Math.round(box.top + window.scrollY),
      height: Math.round(box.height),
      viewport: window.innerHeight,
      max: Math.round(document.documentElement.scrollHeight - window.innerHeight),
    };
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

    await page.goto(`${baseUrl}/campaigns`, { waitUntil: "load", timeout: 60_000 });
    await page.locator(".camp-pledges").waitFor({ state: "visible" });

    const counts = await page.evaluate(() => {
      const field = document.querySelector(".camp-pledges__field");
      const marks = [...field.children];
      const next = marks.findIndex((mark) => mark.hasAttribute("data-next"));
      return {
        places: marks.length,
        got: marks.filter((mark) => mark.hasAttribute("data-got")).length,
        nextAt: next,
        nextTotal: marks.filter((mark) => mark.hasAttribute("data-next")).length,
        label: field.getAttribute("aria-label"),
        free: Number(document.querySelector(".camp-pledges__rest b").textContent),
      };
    });

    // Место следующего взноса стоит сразу за последней оплаченной меткой:
    // сдвиг на единицу означает, что поле врёт о том, куда вставать.
    assert.equal(counts.nextTotal, 1, `${viewport.name}: свободных мест отмечено ${counts.nextTotal}`);
    assert.equal(counts.nextAt, counts.got, `${viewport.name}: место следующего взноса не на границе`);
    assert.equal(
      counts.free,
      counts.places - counts.got,
      `${viewport.name}: крупная цифра не сходится с полем`,
    );
    assert.match(counts.label, /Поле из \d+ меток/, `${viewport.name}: у поля нет подписи для читалки`);

    // Клавиатура: до призыва можно дойти табом, и кольцо фокуса видно.
    // Метки в дерево доступности не попадают вовсе: пятьсот пятьдесят пустых
    // элементов читалка озвучивала бы дольше, чем всю остальную страницу.
    await page.evaluate(() => window.scrollTo(0, 0));
    const focus = await (async () => {
      for (let step = 0; step < 40; step += 1) {
        await page.keyboard.press("Tab");
        const state = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active || !active.classList.contains("camp-pledges__cta")) return null;
          const style = getComputedStyle(active);
          return { outline: style.outlineWidth, name: active.textContent.trim() };
        });
        if (state) return state;
      }
      return null;
    })();

    assert.ok(focus, `${viewport.name}: до призыва сцены не дойти с клавиатуры`);
    assert.ok(
      Number.parseFloat(focus.outline) >= 2,
      `${viewport.name}: кольцо фокуса на призыве не видно (${focus.outline})`,
    );
    assert.match(focus.name, /Сделать следующий взнос/, `${viewport.name}: призыв без внятной подписи`);

    const marksSpoken = await page.evaluate(() =>
      [...document.querySelectorAll(".camp-pledges__field i")].filter(
        (mark) => mark.getAttribute("aria-label") || mark.textContent.trim(),
      ).length,
    );
    assert.equal(marksSpoken, 0, `${viewport.name}: метки полезли в дерево доступности`);

    const geometry = await frame(page);
    const coverStart = geometry.top - geometry.viewport;
    const coverSpan = geometry.viewport + geometry.height;

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(overflow <= 1, `${viewport.name}: перелив по горизонтали ${overflow}px`);

    const row = [];
    for (const stop of STOPS) {
      const target = Math.max(0, Math.min(geometry.max, Math.round(coverStart + stop * coverSpan)));
      await page.evaluate((y) => window.scrollTo(0, y), target);
      await page.waitForTimeout(220);
      row.push({
        stop,
        y: target,
        landed: await landedCount(page),
        shown: await page.$$eval(
          "[data-got]",
          (nodes) => nodes.filter((node) => Number(getComputedStyle(node).opacity) > 0.15).length,
        ),
        number: await page.$eval(".camp-pledges__rest b", (node) => Number(getComputedStyle(node).opacity)),
      });
    }

    const landed = row.map((point) => point.landed);

    // Крупная цифра итога стоит фактом и не проявляется по прокрутке: полоса
    // умещается в экран целиком, и подпись без числа не читалась бы вовсе.
    const numberHidden = row.filter((point) => point.number < 0.95).length;
    assert.equal(numberHidden, 0, `${viewport.name}: цифра итога пропадала в ${numberHidden} точках`);

    // Поле не врёт ни в одном кадре прокрутки: оплаченных меток видно ровно
    // столько, сколько их есть, даже до того, как по ним прошла волна.
    const underReported = row.filter((point) => point.shown < counts.got);
    assert.equal(
      underReported.length,
      0,
      `${viewport.name}: поле показывало меньше оплаченных меток на ${underReported
        .map((point) => `${Math.round(point.stop * 100)}%`)
        .join(", ")}`,
    );

    const line = row.map((point) => `${Math.round(point.stop * 100)}%:${point.landed}`).join("  ");
    console.log(
      `${viewport.name.padEnd(15)} ${counts.got}/${counts.places} меток, поле ${overflow <= 1 ? "без перелива" : "ПЕРЕЛИВ"}\n` +
        `${" ".repeat(16)}${line}`,
    );

    if (viewport.reducedMotion === "reduce") {
      // Гашение движения показывает итог, а не исходное состояние.
      const settled = await page.evaluate(() => {
        const got = [...document.querySelectorAll("[data-got]")];
        const visible = got.filter((mark) => Number(getComputedStyle(mark).opacity) > 0.95).length;
        const light = Number(getComputedStyle(document.querySelector(".camp-pledges__light")).opacity);
        const ripple = document.querySelector("[data-next]").getAnimations({ subtree: true }).length;
        return { visible, total: got.length, light, ripple };
      });
      assert.equal(settled.visible, settled.total, "reduced motion: метки остались незажжёнными");
      assert.ok(settled.light > 0.9, "reduced motion: свет над полем не зажёгся");
      assert.equal(settled.ripple, 0, "reduced motion: волна у свободного места не погашена");
      console.log(`${" ".repeat(16)}гашение: ${settled.visible}/${settled.total} меток, свет ${settled.light}`);
    } else {
      // Сцена не должна доигрывать до того, как читатель её увидел.
      assert.equal(landed[0], 0, `${viewport.name}: сцена уже отыграла на входе в отрезок`);
      assert.equal(
        landed[landed.length - 1],
        counts.got,
        `${viewport.name}: сцена не доиграла до конца отрезка`,
      );
      // Ряд, а не ступенька: очередь обязана расходиться постепенно.
      const distinct = new Set(landed).size;
      assert.ok(distinct >= 5, `${viewport.name}: очередь идёт ступенькой, различных состояний ${distinct}`);
      for (let i = 1; i < landed.length; i += 1) {
        assert.ok(landed[i] >= landed[i - 1], `${viewport.name}: очередь пошла назад на ${STOPS[i]}`);
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

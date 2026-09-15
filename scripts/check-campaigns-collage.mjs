import assert from "node:assert/strict";
import { chromium } from "playwright-core";

/**
 * Контракт на страницу сборов: обложку, каталог, «Куда уходит взнос» и
 * финальный призыв.
 *
 * Проверяется не красота, а грамматика, которую подтвердил владелец, и то,
 * что сцены действительно играют: плоское поле своего цвета у каждой секции,
 * вырезки лежат поверх него, геометрические фигуры за ними, главная вырезка
 * переходит через шов и не наступает на фильтр, слои плывут по прокрутке с
 * разной скоростью, нужды въезжают по очереди, миска падает, подвал ложится
 * на янтарное поле, а не на серый лист.
 *
 * Скриншот показывает один кадр и молчит о том, когда этот кадр наступает,
 * поэтому движение снимается замером в нескольких точках. Хороший вывод это
 * ряд, а не ступенька.
 *
 * Запуск: node scripts/check-campaigns-collage.mjs [baseUrl] [имя ширины]
 */

const baseUrl = process.argv[2] || "http://localhost:3000";
const filter = process.argv[3];

const allViewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "desktop-tall", width: 1440, height: 1200 },
  { name: "wide", width: 1920, height: 1080 },
  { name: "laptop", width: 1024, height: 800 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 700 },
  { name: "reduced-motion", width: 1440, height: 900, reducedMotion: "reduce" },
];

const viewports = filter ? allViewports.filter((v) => v.name === filter) : allViewports;
assert.ok(viewports.length > 0, `неизвестная ширина: ${filter}`);

/** Доли пути секции мимо экрана, в которых снимается движение. */
const STOPS = [0, 0.25, 0.5, 0.75, 1];

/** Сдвиг слоя по вертикали. framer пишет его в transform, а не в translate. */
const shift = (page, selector) =>
  page.$$eval(selector, (nodes) =>
    nodes.map((node) => Math.round(new DOMMatrixReadOnly(getComputedStyle(node).transform).m42)),
  );

/** Прокрутка с проверкой, что она встала: Fast Refresh любит сбрасывать её. */
async function scrollTo(page, target, label) {
  let landed = -1;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.evaluate((y) => window.scrollTo(0, y), target);
    await page.waitForTimeout(240);
    landed = await page.evaluate(() => Math.round(window.scrollY));
    if (Math.abs(landed - target) <= 2) break;
  }
  assert.ok(Math.abs(landed - target) <= 2, `${label}: прокрутка не встала на ${target}px, осталась на ${landed}px`);
}

/** Где секция стоит в документе и сколько нужно прокрутить до её доли пути. */
async function passage(page, selector) {
  return page.evaluate((sel) => {
    const box = document.querySelector(sel).getBoundingClientRect();
    return {
      top: Math.round(box.top + window.scrollY),
      height: Math.round(box.height),
      viewport: window.innerHeight,
      max: Math.round(document.documentElement.scrollHeight - window.innerHeight),
    };
  }, selector);
}

const at = (section, stop) =>
  Math.max(
    0,
    Math.min(section.max, Math.round(section.top - section.viewport + stop * (section.height + section.viewport))),
  );

const browser = await chromium.launch({ channel: "chrome", headless: true });
let failed = false;

try {
  for (const viewport of viewports) {
    const reduced = viewport.reducedMotion === "reduce";
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: reduced ? "reduce" : "no-preference",
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
    // Вырезки вскакивают на поле пружиной; ждём, пока все встанут.
    await page.waitForTimeout(2600);

    const shape = await page.evaluate(() => {
      const paint = (selector) => getComputedStyle(document.querySelector(selector)).backgroundColor;
      const rect = (node) => {
        const box = node.getBoundingClientRect();
        return { top: box.top + window.scrollY, bottom: box.bottom + window.scrollY };
      };
      /* Выход за кромку меряется по раскладке, а не по экранным коробкам:
         слои коллажа сдвинуты трансформацией дрейфа. По offsetTop дрейфа
         не видно, а видно именно то, что задано в стилях. */
      const coverField = document.querySelector(".camp-cover__field");
      const pets = [...document.querySelectorAll(".camp-cover__pet")].map((node) =>
        Math.round(node.offsetTop + node.offsetHeight - coverField.offsetHeight),
      );
      const shown = [...document.querySelectorAll(".camp-cover__pet")].filter(
        (node) => getComputedStyle(node).display !== "none",
      );
      const landed = shown.map((node) => {
        const img = node.querySelector("img");
        const style = getComputedStyle(img);
        return {
          opacity: Number(style.opacity),
          scale: Math.round(new DOMMatrixReadOnly(style.transform).a * 100) / 100,
        };
      });
      const lead = document.querySelector(".camp-cover__pet--lead img");
      const controls = document.querySelector(".camp-controls");
      const call = document.querySelector(".camp-call");
      const footer = document.querySelector("footer");
      const bowl = document.querySelector(".camp-call__bowl");
      return {
        coverPaint: paint(".camp-cover"),
        routePaint: paint(".camp-route"),
        callPaint: paint(".camp-call"),
        sheetPaint: paint(".camp"),
        callBleed: -Math.round(bowl.offsetTop),
        ownCard: document.querySelectorAll(".camp-grid__own, .camp-card--own").length,
        pets: document.querySelectorAll(".camp-cover__pet").length,
        landed,
        discs: document.querySelectorAll(".camp-cover__disc, .camp-cover__ring, .camp-route__disc, .camp-call__disc").length,
        dots: document.querySelectorAll(".camp-cover__dots, .camp-route__dots, .camp-call__dots").length,
        needs: document.querySelectorAll(".camp-route__need").length,
        sums: [...document.querySelectorAll(".camp-route__need b")].map((n) => n.textContent.trim()),
        goals: [...document.querySelectorAll(".camp-route__of")].map((n) => n.textContent.trim()),
        bleed: Math.max(...pets),
        plate: getComputedStyle(document.querySelector(".camp-cover h1 em")).backgroundColor,
        pawsToControls: Math.round(rect(controls).top - rect(lead).bottom),
        footerOverlap: Math.round(rect(call).bottom - rect(footer).top),
        tabs: document.querySelectorAll(".camp-tab").length,
        checked: document.querySelectorAll('.camp-tab[aria-checked="true"]').length,
        sort: document.querySelectorAll('[id^="dropdown-btn"]').length,
        cards: document.querySelectorAll(".camp-item").length,
        shots: document.querySelectorAll(".camp-item__shot img").length,
        heading: document.querySelector("#camp-list-title")?.textContent.trim() ?? "",
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
    // Фигура без предмета не встречается: у каждой нужды свой круг и своя
    // сетка точек, плюс по группе на обложке и в финале.
    assert.ok(shape.discs >= shape.needs + 2, `${viewport.name}: кругов ${shape.discs} при ${shape.needs} нуждах`);
    assert.ok(shape.dots >= shape.needs + 2, `${viewport.name}: сеток точек ${shape.dots} при ${shape.needs} нуждах`);
    assert.ok(shape.goals.every((goal) => /\d/.test(goal)), `${viewport.name}: у нужды нет «собрано из»`);
    assert.ok(shape.needs >= 1, `${viewport.name}: нужд на поле нет вовсе`);
    assert.ok(
      shape.sums.every((sum) => /\d/.test(sum)),
      `${viewport.name}: у нужды пропала сумма`,
    );

    // Вырезки вскочили и стоят: непрозрачные, в натуральную величину.
    for (const pet of shape.landed) {
      assert.ok(pet.opacity > 0.98, `${viewport.name}: вырезка не проявилась (${pet.opacity})`);
      assert.ok(Math.abs(pet.scale - 1) < 0.03, `${viewport.name}: вырезка не встала в размер (${pet.scale})`);
    }

    // Прямоугольных фотоблоков в сценах быть не должно: за них отклонены семь
    // предыдущих заходов.
    const slabs = await page.evaluate(
      () => document.querySelectorAll(".camp-cover__yard, .camp-cover__veil, .camp-route__strip").length,
    );
    assert.equal(slabs, 0, `${viewport.name}: в сцене осталась прямоугольная фотополоса`);

    // Главная вырезка уходит за нижнюю кромку обложки и ложится на следующее
    // поле. Это тот самый переход через шов.
    assert.ok(shape.bleed > 4, `${viewport.name}: вырезка не переходит через шов (${shape.bleed}px)`);

    // И при этом лапы не наступают на фильтр: под них у каталога отступ.
    assert.ok(
      shape.pawsToControls >= 8,
      `${viewport.name}: вырезка наступает на фильтр (зазор ${shape.pawsToControls}px)`,
    );

    // Подвал ложится на янтарное поле: иначе в его скруглённых углах лежал бы
    // серый лист, и углы читались бы двумя ушами.
    assert.ok(
      shape.footerOverlap >= 30,
      `${viewport.name}: подвал не заходит на янтарное поле (${shape.footerOverlap}px)`,
    );

    assert.notEqual(shape.plate, "rgba(0, 0, 0, 0)", `${viewport.name}: плашка под словом пропала`);

    // Каталог: заголовок с числом, две вкладки с одной включённой, сортировка,
    // у каждого сбора круглый кадр.
    assert.match(shape.heading, /^\d+ сбор/, `${viewport.name}: заголовок каталога без числа: «${shape.heading}»`);
    assert.equal(shape.tabs, 2, `${viewport.name}: вкладок фильтра ${shape.tabs}`);
    assert.equal(shape.checked, 1, `${viewport.name}: включённых вкладок ${shape.checked}`);
    assert.equal(shape.sort, 1, `${viewport.name}: сортировки нет`);
    assert.ok(shape.cards > 0, `${viewport.name}: каталог пуст`);
    assert.equal(shape.shots, shape.cards, `${viewport.name}: у сбора нет кадра`);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(overflow <= 1, `${viewport.name}: перелив по горизонтали ${overflow}px`);

    // Обложка: слои стоят на месте при нулевой прокрутке и уезжают по мере
    // её ухода. Раньше отсчёт шёл от середины пути, и при загрузке всё было
    // уже сдвинуто.
    const cover = await passage(page, ".camp-cover");
    const restingLead = (await shift(page, ".camp-cover__pet--lead"))[0];
    assert.equal(restingLead, 0, `${viewport.name}: вырезка при загрузке уже сдвинута на ${restingLead}px`);
    await scrollTo(page, Math.min(cover.max, Math.round(cover.height * 0.5)), viewport.name);
    const movedLead = (await shift(page, ".camp-cover__pet--lead"))[0];
    if (reduced) {
      assert.equal(movedLead, 0, "reduced motion: обложка плывёт");
    } else {
      assert.ok(movedLead < -10, `${viewport.name}: обложка не плывёт по прокрутке (${movedLead}px)`);
    }

    // «Куда уходит взнос»: дрейф слоёв и очередь въезда нужд.
    const route = await passage(page, ".camp-route");
    const row = [];
    for (const stop of STOPS) {
      await scrollTo(page, at(route, stop), viewport.name);
      row.push({
        stop,
        needs: await shift(page, ".camp-route__figure"),
        shown: await page.$$eval(
          ".camp-route__link",
          (links) => links.filter((link) => Number(getComputedStyle(link).opacity) > 0.85).length,
        ),
      });
    }

    const line = row
      .map((point) => `${Math.round(point.stop * 100)}%:${point.needs.join("/")} (видно ${point.shown})`)
      .join("  ");
    console.log(
      `${viewport.name.padEnd(15)} поля ${shape.coverPaint} и ${shape.routePaint}, вырезок ${shape.pets}, нужд ${shape.needs}, зазор до фильтра ${shape.pawsToControls}px, подвал на поле ${shape.footerOverlap}px`,
    );
    console.log(`${" ".repeat(16)}${line}`);

    if (reduced) {
      // Гашение движения: слои стоят на местах, нужды видны сразу.
      const moved = row.flatMap((point) => point.needs).filter((value) => value !== 0);
      assert.deepEqual(moved, [], "reduced motion: слои коллажа всё ещё плывут");
      assert.ok(
        row.every((point) => point.shown === shape.needs),
        "reduced motion: нужды не показаны итогом",
      );
      console.log(`${" ".repeat(16)}гашение: дрейфа нет, нужды стоят`);
    } else {
      const first = row[0].needs;
      const last = row[row.length - 1].needs;

      // Слои плывут и плывут по-разному: одинаковая скорость это не коллаж,
      // а одна картинка, которую подвинули целиком.
      assert.ok(
        first.some((value, index) => value !== last[index]),
        `${viewport.name}: слои не сдвинулись за весь проход`,
      );
      assert.ok(new Set(last).size > 1, `${viewport.name}: все слои уехали на одно и то же, глубины нет`);

      for (let i = 1; i < row.length; i += 1) {
        for (let n = 0; n < row[i].needs.length; n += 1) {
          assert.ok(
            row[i].needs[n] <= row[i - 1].needs[n] + 1,
            `${viewport.name}: слой ${n} поехал назад на ${STOPS[i]}`,
          );
        }
      }

      // Нужды въезжают по очереди: пока секция внизу экрана, их не видно, к
      // концу прохода видны все, и число видимых не убывает.
      assert.equal(row[0].shown, 0, `${viewport.name}: нужды видны до входа секции (${row[0].shown})`);
      assert.equal(row[row.length - 1].shown, shape.needs, `${viewport.name}: не все нужды въехали`);
      for (let i = 1; i < row.length; i += 1) {
        assert.ok(row[i].shown >= row[i - 1].shown, `${viewport.name}: нужда пропала на ${STOPS[i]}`);
      }
    }

    // Суммы набежали до настоящих значений: ни одна не осталась на нуле.
    await page.waitForTimeout(1700);
    const counted = await page.$$eval(".camp-route__need b", (nodes) => nodes.map((n) => n.textContent.trim()));
    assert.ok(
      counted.every((sum) => !/^0\s*₽/.test(sum)),
      `${viewport.name}: сумма осталась на нуле: ${counted.join(", ")}`,
    );

    // Финал: миска падает, пока секция входит в экран. Внизу экрана её ещё
    // нет, к середине входа она на месте.
    const call = await passage(page, ".camp-call");
    await scrollTo(page, at(call, 0), viewport.name);
    const bowlBefore = await page.$eval(".camp-call__bowl img", (img) => Number(getComputedStyle(img).opacity));
    await scrollTo(page, at(call, 0.5), viewport.name);
    const bowlAfter = await page.$eval(".camp-call__bowl img", (img) => Number(getComputedStyle(img).opacity));
    if (reduced) {
      assert.ok(bowlBefore > 0.98 && bowlAfter > 0.98, "reduced motion: миска не показана итогом");
    } else {
      assert.ok(bowlBefore < 0.5, `${viewport.name}: миска видна до входа секции (${bowlBefore})`);
      assert.ok(bowlAfter > 0.98, `${viewport.name}: миска не упала на место (${bowlAfter})`);
    }
    console.log(`${" ".repeat(16)}миска: ${bowlBefore} → ${bowlAfter}`);

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

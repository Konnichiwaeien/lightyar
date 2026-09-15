import assert from "node:assert/strict";
import { chromium } from "playwright-core";

/**
 * Контракт на страницу сборов: обложку, каталог, закреплённую сцену «На что
 * идут ваши деньги» и финальный призыв.
 *
 * Проверяется не красота, а грамматика, которую подтвердил владелец, и то,
 * что механики с референсов действительно играют: плоское поле своего цвета
 * у каждой секции, вырезки на своих фигурах, главная вырезка через шов и не
 * на фильтре, вырезки едут за мышью, плашки прочерчены, вещи в сцене
 * съезжаются по прокрутке и суммы набегают, миска падает, подвал ложится на
 * янтарное поле, а не на серый лист.
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

/** Доли пути сцены, в которых снимается движение. */
const STOPS = [0, 0.25, 0.5, 0.75, 1];

/** Сдвиг слоя по горизонтали и вертикали. framer пишет его в transform. */
const shift = (page, selector, axis = "y") =>
  page.$$eval(
    selector,
    (nodes, ax) =>
      nodes.map((node) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(node).transform);
        return Math.round(ax === "x" ? m.m41 : m.m42);
      }),
    axis,
  );

/** Прокрутка с проверкой, что она встала: Fast Refresh любит сбрасывать её. */
async function scrollTo(page, target, label) {
  let landed = -1;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.evaluate((y) => window.scrollTo(0, y), target);
    await page.waitForTimeout(260);
    landed = await page.evaluate(() => Math.round(window.scrollY));
    if (Math.abs(landed - target) <= 2) break;
  }
  assert.ok(Math.abs(landed - target) <= 2, `${label}: прокрутка не встала на ${target}px, осталась на ${landed}px`);
}

/** Где секция стоит в документе. */
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

/** Прокрутка до доли прохода секции мимо экрана. */
const through = (section, stop) =>
  Math.max(
    0,
    Math.min(section.max, Math.round(section.top - section.viewport + stop * (section.height + section.viewport))),
  );

/** Прокрутка до доли пути закреплённой сцены: от верха секции у верха экрана
    до низа секции у низа экрана. */
const pinned = (section, stop) =>
  Math.max(0, Math.min(section.max, Math.round(section.top + stop * (section.height - section.viewport))));

const browser = await chromium.launch({ channel: "chrome", headless: true });
let failed = false;

try {
  for (const viewport of viewports) {
    const reduced = viewport.reducedMotion === "reduce";
    const compact = viewport.width <= 860;
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
    // Вырезки вскакивают на поле пружиной, плашки прочерчиваются; ждём.
    await page.waitForTimeout(2800);

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
      const marks = [...document.querySelectorAll(".camp-cover .camp-mark")].map(
        (mark) => getComputedStyle(mark).backgroundSize,
      );
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
        pets: shown.length,
        landed,
        marks,
        discs: document.querySelectorAll(".camp-cover__disc, .camp-route__disc, .camp-call__disc").length,
        dots: document.querySelectorAll(".camp-cover__dots, .camp-call__dots").length,
        items: document.querySelectorAll(".camp-route__item img").length,
        labels: document.querySelectorAll(".camp-route__label").length,
        links: document.querySelectorAll(".camp-route a").length,
        goals: [...document.querySelectorAll(".camp-route__of")].map((n) => n.textContent.trim()),
        title: document.querySelector(".camp-cover h1")?.textContent.replace(/\s+/g, " ").trim() ?? "",
        routeTitle: document.querySelector("#camp-route-title")?.textContent.replace(/\s+/g, " ").trim() ?? "",
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
        blackButtons: [...document.querySelectorAll(".camp .camp-btn")].filter(
          (btn) => getComputedStyle(btn).backgroundColor === "rgb(28, 28, 28)",
        ).length,
        cta: document.querySelector(".camp-cover__cta")?.textContent.trim() ?? "",
        dialogHidden: document.querySelector(".camp-donate")?.hidden ?? null,
      };
    });

    // Кнопка обложки: «Помочь», ведёт к каталогу на этой же странице.
    assert.equal(shape.cta, "Помочь", `${viewport.name}: кнопка обложки «${shape.cta}»`);
    assert.equal(shape.dialogHidden, true, `${viewport.name}: диалог помощи открыт при загрузке`);

    /* Поле у каждой секции своё, и это часть языка, а не украшение: в
       референсах цвет меняется от секции к секции. */
    assert.notEqual(shape.coverPaint, shape.routePaint, `${viewport.name}: поля секций одного цвета`);
    assert.notEqual(shape.coverPaint, shape.sheetPaint, `${viewport.name}: обложка не отличается от листа`);
    assert.notEqual(shape.routePaint, shape.callPaint, `${viewport.name}: финал не отличается от предыдущего поля`);

    // Заголовки, как просил владелец: «Все сборы», «На что идут ваши деньги».
    assert.equal(shape.title, "Все сборы", `${viewport.name}: заголовок обложки «${shape.title}»`);
    assert.equal(shape.routeTitle, "На что идут ваши деньги", `${viewport.name}: заголовок сцены «${shape.routeTitle}»`);

    // Чёрных кнопок на странице нет.
    assert.equal(shape.blackButtons, 0, `${viewport.name}: чёрных кнопок ${shape.blackButtons}`);

    // Миска висит над верхней кромкой финала и заходит на предыдущее поле.
    assert.ok(shape.callBleed > 4, `${viewport.name}: миска не переходит через шов (${shape.callBleed}px)`);

    /* Янтарная карточка «Просто помочь» снята: финальная секция говорит ровно
       это же, и держать обе означало сказать одно дважды. */
    assert.equal(shape.ownCard, 0, `${viewport.name}: дублирующая карточка «Просто помочь» вернулась`);

    // На телефоне остаётся один Капрал: вторая вырезка в углу наступала на кикер.
    const leastPets = viewport.width <= 600 ? 1 : 2;
    assert.ok(shape.pets >= leastPets, `${viewport.name}: вырезок на обложке ${shape.pets}, ожидалось хотя бы ${leastPets}`);
    assert.ok(shape.discs >= 3, `${viewport.name}: кругов ${shape.discs}, по одному на секцию`);
    assert.ok(shape.dots >= 2, `${viewport.name}: сеток точек ${shape.dots}`);
    assert.ok(shape.items >= 1, `${viewport.name}: вещей на сцене нет вовсе`);
    assert.equal(shape.labels, shape.items, `${viewport.name}: подписей ${shape.labels} при ${shape.items} вещах`);
    assert.equal(shape.links, 0, `${viewport.name}: на сцене есть ссылки, а она не кликается`);
    assert.ok(shape.goals.every((goal) => /\d/.test(goal)), `${viewport.name}: у нужды нет «из»`);

    // Вырезки вскочили и стоят: непрозрачные, в натуральную величину.
    for (const pet of shape.landed) {
      assert.ok(pet.opacity > 0.98, `${viewport.name}: вырезка не проявилась (${pet.opacity})`);
      assert.ok(Math.abs(pet.scale - 1) < 0.03, `${viewport.name}: вырезка не встала в размер (${pet.scale})`);
    }

    // Плашки на словах прочерчены до конца.
    assert.ok(shape.marks.length >= 2, `${viewport.name}: плашек на обложке ${shape.marks.length}`);
    assert.ok(
      shape.marks.every((size) => size.startsWith("100%")),
      `${viewport.name}: плашка не прочерчена: ${shape.marks.join(" | ")}`,
    );

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

    // Мышиный параллакс, механика с обложки Vogue: вырезки едут за курсором.
    // Курсор слева и справа, главная вырезка сдвинута в разные стороны.
    let mouse = "нет мыши";
    if (!compact) {
      const cover = await page.$eval(".camp-cover", (node) => {
        const box = node.getBoundingClientRect();
        return { left: box.left, top: box.top, width: box.width, height: box.height };
      });
      await page.mouse.move(cover.left + cover.width * 0.08, cover.top + cover.height * 0.5, { steps: 8 });
      await page.waitForTimeout(900);
      const [leftX] = await shift(page, ".camp-cover__pet--lead .camp-cover__mouse", "x");
      await page.mouse.move(cover.left + cover.width * 0.92, cover.top + cover.height * 0.5, { steps: 8 });
      await page.waitForTimeout(900);
      const [rightX] = await shift(page, ".camp-cover__pet--lead .camp-cover__mouse", "x");
      mouse = `${leftX} → ${rightX}`;
      if (reduced) {
        assert.ok(leftX === 0 && rightX === 0, `reduced motion: вырезки едут за мышью (${mouse})`);
      } else {
        assert.ok(leftX < -8 && rightX > 8, `${viewport.name}: вырезки не едут за мышью (${mouse})`);
      }
      await page.mouse.move(cover.left + cover.width * 0.5, cover.top + cover.height * 0.5);
      await page.waitForTimeout(600);
    }

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

    // Сцена: вещи съезжаются по прокрутке. На широком экране сцена
    // закреплена и путь идёт внутри секции, на узком по её проходу.
    const route = await passage(page, ".camp-route");
    const row = [];
    for (const stop of STOPS) {
      await scrollTo(page, compact ? through(route, stop) : pinned(route, stop), viewport.name);
      const xs = await shift(page, ".camp-route__item", "x");
      const home = await page.$$eval(
        ".camp-route__item",
        (nodes) =>
          nodes.filter((node) => {
            const m = new DOMMatrixReadOnly(getComputedStyle(node).transform);
            return Math.abs(m.m41) < 2 && Number(getComputedStyle(node).opacity) > 0.95;
          }).length,
      );
      row.push({ stop, xs, home });
    }

    const line = row.map((point) => `${Math.round(point.stop * 100)}%:${point.xs.join("/")} (на месте ${point.home})`).join("  ");
    console.log(
      `${viewport.name.padEnd(15)} вырезок ${shape.pets}, вещей ${shape.items}, мышь ${mouse}, зазор до фильтра ${shape.pawsToControls}px, подвал на поле ${shape.footerOverlap}px`,
    );
    console.log(`${" ".repeat(16)}${line}`);

    if (reduced) {
      assert.ok(row.every((point) => point.home === shape.items), "reduced motion: вещи не стоят на местах");
      console.log(`${" ".repeat(16)}гашение: вещи стоят`);
    } else {
      // В начале пути вещи за кадром, к концу все на местах, и число вставших
      // не убывает: это очередь, а не мигание.
      assert.equal(row[0].home, 0, `${viewport.name}: вещи на местах до начала пути (${row[0].home})`);
      assert.equal(row[row.length - 1].home, shape.items, `${viewport.name}: не все вещи доехали`);
      for (let i = 1; i < row.length; i += 1) {
        assert.ok(row[i].home >= row[i - 1].home, `${viewport.name}: вещь уехала обратно на ${STOPS[i]}`);
      }
    }

    // Суммы набежали до настоящих значений: ни одна не осталась на нуле.
    const counted = await page.$$eval(".camp-route__label b", (nodes) => nodes.map((n) => n.textContent.trim()));
    assert.ok(
      counted.every((sum) => /\d/.test(sum) && !/^0\s*₽/.test(sum)),
      `${viewport.name}: сумма осталась на нуле: ${counted.join(", ")}`,
    );

    // Кнопка обложки везёт к каталогу: после нажатия его верх у верха экрана.
    await scrollTo(page, 0, viewport.name);
    await page.locator(".camp-cover__cta").click();
    await page.waitForTimeout(1600);
    const listTop = await page.$eval("#camp-list", (node) => Math.round(node.getBoundingClientRect().top));
    assert.ok(Math.abs(listTop) <= 40, `${viewport.name}: кнопка обложки не привезла к каталогу (верх на ${listTop}px)`);

    // «Помочь» на карточке открывает панель помощи с этим сбором, Escape закрывает.
    const firstTitle = (await page.locator(".camp-item__title a").first().textContent()).trim();
    await page.locator(".camp-item .camp-btn").first().click();
    await page.waitForTimeout(300);
    assert.equal(await page.$eval(".camp-donate", (node) => node.hidden), false, `${viewport.name}: панель помощи не открылась с карточки`);
    // Панель грузится динамически: ждём её, а не фиксированную паузу.
    await page.locator(".camp-donate .donation-intent strong").waitFor({ state: "visible", timeout: 20_000 });
    const intentTitle = (await page.locator(".camp-donate .donation-intent strong").textContent()).trim();
    assert.equal(intentTitle, firstTitle, `${viewport.name}: в панели не тот сбор: «${intentTitle}»`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    assert.equal(await page.$eval(".camp-donate", (node) => node.hidden), true, `${viewport.name}: панель не закрылась по Escape`);

    // «Сделать взнос» в финале открывает панель без назначения.
    await page.locator(".camp-call__cta").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.locator(".camp-call__cta").click();
    await page.waitForTimeout(400);
    assert.equal(await page.$eval(".camp-donate", (node) => node.hidden), false, `${viewport.name}: панель помощи не открылась из финала`);
    await page.locator(".camp-donate__close").click();
    await page.waitForTimeout(300);
    assert.equal(await page.$eval(".camp-donate", (node) => node.hidden), true, `${viewport.name}: панель не закрылась крестиком`);
    console.log(`${" ".repeat(16)}кнопки: обложка везёт к каталогу (${listTop}px), карточка открывает панель со сбором «${intentTitle.slice(0, 24)}…», финал открывает панель`);

    // Финал: миска падает, пока секция входит в экран. Внизу экрана её ещё
    // нет, к середине входа она на месте.
    const call = await passage(page, ".camp-call");
    await scrollTo(page, through(call, 0), viewport.name);
    const bowlBefore = await page.$eval(".camp-call__bowl img", (img) => Number(getComputedStyle(img).opacity));
    await scrollTo(page, through(call, 0.5), viewport.name);
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

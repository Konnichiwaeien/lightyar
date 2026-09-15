import assert from "node:assert/strict";
import { chromium } from "playwright-core";

/**
 * Приёмка страницы одного сбора.
 *
 * Страница переехала в язык каталога: плоские цветные поля, кадр в круге,
 * рисованные значки, окно помощи вместо своей формы. Здесь это проверяется
 * замерами, а не взглядом на один снимок.
 *
 * Запуск: node scripts/check-fund-page.mjs [адрес] [имя окна]
 * Адрес каталога нужен затем, что сам сбор берётся из него: захардкоженный
 * идентификатор протухнет на первой же смене данных.
 */

const baseUrl = process.argv[2] || "http://localhost:3000";
const only = process.argv[3];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1024, height: 800 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 700 },
  { name: "reduced-motion", width: 1440, height: 900, reducedMotion: "reduce" },
];

/* Поля идут сверху вниз в заданном ряду цветов: кремовое, лист, тёплое
   кремовое, лист, янтарь. Это не украшение, а способ отделить секции без
   рамок и карточек. */
const FIELDS = [
  ["fund-cover", "rgb(236, 227, 210)"],
  ["fund-story", "rgb(244, 241, 235)"],
  ["fund-backers", "rgb(243, 230, 205)"],
  ["fund-more", "rgb(244, 241, 235)"],
  ["camp-call", "rgb(245, 158, 11)"],
];

const EMOJI = /\p{Extended_Pictographic}/u;

const ratio = (fg, bg) => {
  const lum = (c) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const [a, b] = [lum(fg) + 0.05, lum(bg) + 0.05];
  return Math.max(a, b) / Math.min(a, b);
};

const browser = await chromium.launch({ channel: "chrome" });

/* Сбор берём первый из каталога: так проверка идёт по живым данным. */
const finder = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await finder.goto(`${baseUrl}/campaigns`, { waitUntil: "networkidle" });
const href = await finder.$eval(".camp-item__title a", (node) => node.getAttribute("href"));
await finder.close();
const url = `${baseUrl}${href}`;

/* Разметка для поисковика проверяется по отданному документу, а не по DOM:
   React 19 переносит часть тегов сам, и в браузере скрипт может оказаться на
   месте, а в ответе сервера его не будет. */
const served = await fetch(url).then((response) => response.text());
assert.match(served, /"@type":"BreadcrumbList"/, "в отданной разметке нет хлебных крошек для поисковика");
assert.doesNotMatch(served, /background-color:\s*#faf8f5\s*!important/, "вернулась заплатка фона через !important");
console.log("разметка: хлебные крошки в ответе сервера есть, заплатки фона нет");

let failed = 0;

for (const viewport of VIEWPORTS.filter((item) => !only || item.name === only)) {
  const compact = viewport.width <= 860;
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: viewport.reducedMotion,
  });
  const noise = [];
  page.on("console", (message) => {
    if (message.type() === "error") noise.push(message.text().slice(0, 120));
  });
  page.on("pageerror", (error) => noise.push(`сбой: ${error.message.slice(0, 120)}`));

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);

    const shape = await page.evaluate(
      ({ fields }) => {
        const css = (selector, property) => {
          const node = document.querySelector(selector);
          return node ? getComputedStyle(node)[property] : null;
        };
        const shot = document.querySelector(".fund-shots__stack");
        const story = document.querySelector(".fund-story__text p");
        return {
          fields: fields.map(([name]) => css(`.${name}`, "backgroundColor")),
          order: [...document.querySelectorAll("main > section")].map((node) => node.className.split(" ")[0]),
          title: document.querySelector("h1")?.textContent.trim() ?? "",
          headings: [...document.querySelectorAll("h2")].map((node) => node.textContent.trim()),
          /* Кадр обязан быть кругом: прямоугольный снимок в рамке и есть тот
             фотоблок, ради отказа от которого страница переделывалась. */
          shot: shot
            ? {
                radius: getComputedStyle(shot).borderRadius,
                side: Math.round(shot.getBoundingClientRect().width),
                tall: Math.round(shot.getBoundingClientRect().height),
              }
            : null,
          framed: [...document.querySelectorAll("main img")].filter((img) => {
            const box = img.closest("div, figure, span, a");
            if (!box) return false;
            const style = getComputedStyle(box);
            return parseFloat(style.borderTopWidth) > 1 && !style.borderRadius.startsWith("50%");
          }).length,
          /* Ширина колонки текста: длиннее семидесяти пяти знаков глаз теряет
             начало следующей строки. */
          measure: story ? Math.round(story.getBoundingClientRect().width / (parseFloat(getComputedStyle(story).fontSize) * 0.5)) : 0,
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          emoji: document.querySelector("main").innerText,
          dock: [...document.querySelectorAll(".fund-dock")].filter((node) => getComputedStyle(node).display !== "none").length,
          bar: css(".fund-money__bar", "height"),
          shimmer: getComputedStyle(document.querySelector(".fund-money__bar i"), "::after").animationName,
        };
      },
      { fields: FIELDS },
    );

    for (const [index, [name, tone]] of FIELDS.entries()) {
      assert.equal(shape.fields[index], tone, `${viewport.name}: поле ${name} не того цвета: ${shape.fields[index]}`);
    }
    assert.deepEqual(
      shape.order,
      FIELDS.map(([name]) => name),
      `${viewport.name}: секции идут не в том порядке: ${shape.order.join(", ")}`,
    );
    assert.ok(shape.title.length > 0, `${viewport.name}: у страницы нет заголовка`);
    for (const heading of ["О сборе", "Другие сборы"]) {
      assert.ok(
        shape.headings.some((item) => item.replace(/\s+/g, " ").includes(heading)),
        `${viewport.name}: нет заголовка «${heading}»: ${shape.headings.join(" | ")}`,
      );
    }
    assert.ok(shape.shot, `${viewport.name}: кадра сбора нет вовсе`);
    assert.equal(shape.shot.radius, "50%", `${viewport.name}: кадр не круглый (${shape.shot.radius})`);
    assert.equal(shape.shot.side, shape.shot.tall, `${viewport.name}: кадр не квадратный по боксу`);
    assert.equal(shape.framed, 0, `${viewport.name}: на странице ${shape.framed} снимков в рамке`);
    assert.ok(shape.measure <= 78, `${viewport.name}: строка текста в ${shape.measure} знаков`);
    assert.ok(shape.overflow <= 1, `${viewport.name}: перелив по горизонтали ${shape.overflow}px`);
    assert.doesNotMatch(shape.emoji, EMOJI, `${viewport.name}: в тексте остались эмодзи вместо значков`);
    assert.equal(shape.dock, 0, `${viewport.name}: кнопка-догонялка висит с самого верха`);
    assert.equal(shape.bar, "14px", `${viewport.name}: шкала сбора высотой ${shape.bar}`);
    assert.equal(
      shape.shimmer,
      viewport.reducedMotion === "reduce" ? "none" : "camp-shimmer",
      `${viewport.name}: блик на шкале ведёт себя не так: ${shape.shimmer}`,
    );

    /* Контраст ролей текста. Полупрозрачные подложки складываются, иначе
       бейдж меряется сам с собой и даёт единицу. */
    const contrast = await page.evaluate(() => {
      const parse = (value) => value.match(/[\d.]+/g).map(Number);
      const over = (fg, bg) => {
        const [r, g, b, a = 1] = fg;
        return [r * a + bg[0] * (1 - a), g * a + bg[1] * (1 - a), b * a + bg[2] * (1 - a)];
      };
      const ground = (node) => {
        const layers = [];
        let el = node;
        while (el) {
          const bg = parse(getComputedStyle(el).backgroundColor);
          if (bg[3] === undefined || bg[3] > 0) layers.push(bg);
          if (bg[3] === undefined || bg[3] === 1) break;
          el = el.parentElement;
        }
        let base = [255, 255, 255];
        for (const layer of layers.reverse()) base = over(layer, base);
        return base;
      };
      const roles = [
        ".fund-cover__lead",
        ".fund-crumbs a",
        ".fund-money__sums span",
        ".fund-dates",
        ".fund-story__text p",
        ".fund-backer__when",
        ".fund-share__btn",
        ".camp-badge--tag",
        ".camp-btn",
      ];
      return roles.flatMap((selector) => {
        const node = document.querySelector(selector);
        if (!node) return [];
        const style = getComputedStyle(node);
        const bg = ground(node);
        return [
          {
            selector,
            fg: over(parse(style.color), bg),
            bg,
            size: parseFloat(style.fontSize),
            weight: Number(style.fontWeight),
          },
        ];
      });
    });

    for (const role of contrast) {
      const large = role.size >= 24 || (role.size >= 18.66 && role.weight >= 700);
      const need = large ? 3 : 4.5;
      const value = ratio(role.fg, role.bg);
      assert.ok(
        value >= need,
        `${viewport.name}: контраст ${role.selector} ${value.toFixed(2)} при нужных ${need}`,
      );
    }

    /* Кадры переключаются, и переключаются с клавиатуры. */
    let picks = "кадр один";
    if ((await page.$$(".fund-shots__pick")).length > 1) {
      await page.locator(".fund-shots__pick").nth(1).focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(400);
      const state = await page.evaluate(() => ({
        shown: [...document.querySelectorAll(".fund-shots__img")].findIndex((img) => img.dataset.shown === "true"),
        marked: [...document.querySelectorAll(".fund-shots__pick")].findIndex(
          (pick) => pick.getAttribute("aria-current") === "true",
        ),
      }));
      assert.equal(state.shown, 1, `${viewport.name}: кадр не сменился с клавиатуры`);
      assert.equal(state.marked, 1, `${viewport.name}: выбранный кадр не отмечен для читалки`);
      picks = "кадры переключаются с клавиатуры";
    }

    /* Проверяется до окна помощи: закрытое окно возвращает фокус кнопке
       обложки, и страница сама уезжает обратно к ней.

       Кнопка-догонялка появляется, когда кнопка обложки ушла вверх, и только
       на узком экране. Прыжок в конец страницы её тоже включает: наблюдатель
       пересечения такой прыжок проходил молча. */
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(700);
    /* Считаются видимые по display: на широком экране узел остаётся в
       разметке и спрятан правилом. Проверять offsetParent тут нельзя: у
       закреплённого элемента он null всегда, и видимая кнопка считалась
       спрятанной. */
    const dockAtEnd = await page.$$eval(".fund-dock", (nodes) => nodes.filter((node) => getComputedStyle(node).display !== "none").length);
    assert.equal(
      dockAtEnd,
      compact ? 1 : 0,
      `${viewport.name}: внизу страницы кнопок-догонялок ${dockAtEnd}`,
    );

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    /* Кнопка помощи открывает то же окно, что и в каталоге, с этим сбором. */
    await page.locator(".fund-cover__actions .camp-btn, .camp-blank .camp-btn").first().click();
    await page.locator(".camp-donate__body .donation-provider-button").waitFor({ state: "visible", timeout: 20_000 });
    await page.waitForTimeout(500);
    const intent = (await page.locator(".camp-form__intent strong").textContent()).trim();
    assert.equal(intent, shape.title, `${viewport.name}: в окне помощи не тот сбор: «${intent}»`);
    const sheet = await page.$eval(".camp-donate", (node) => node.dataset.sheet === "true");
    assert.equal(sheet, compact, `${viewport.name}: окно помощи в виде ${sheet ? "листа" : "окна"}`);
    await page.keyboard.press("Escape");
    await page.locator(".camp-donate").waitFor({ state: "detached", timeout: 5_000 });

    assert.deepEqual(noise, [], `${viewport.name}: ошибки в консоли: ${noise.join(" | ")}`);

    console.log(
      `${viewport.name.padEnd(15)} поля по ряду, кадр круг ${shape.shot.side}px, строка ${shape.measure} знаков, ${picks}, окно с этим сбором, догонялка внизу ${dockAtEnd}`,
    );
  } catch (error) {
    failed += 1;
    console.error(`${viewport.name.padEnd(15)} ${error.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
if (failed > 0) {
  console.error(`\nпровалов: ${failed}`);
  process.exit(1);
}
console.log("\nстраница сбора: все проверки пройдены");

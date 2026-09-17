import assert from "node:assert/strict";
import { chromium } from "playwright-core";

/**
 * Приёмка страницы одного сбора.
 *
 * Страница использует поля каталога, split-обложку на компьютере,
 * встроенную форму и общее окно помощи. Здесь это проверяется
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
          tabs: [...document.querySelectorAll('[role="tab"]')].map((node) => node.textContent.trim()),
          /* На десктопе фото доходит до края окна, ниже — следует сетке. */
          shot: shot
            ? {
                radius: getComputedStyle(shot).borderRadius,
                wide: Math.round(shot.getBoundingClientRect().width),
                tall: Math.round(shot.getBoundingClientRect().height),
                edge: Math.round(window.innerWidth - shot.getBoundingClientRect().right),
              }
            : null,
          framed: [...document.querySelectorAll("main img:not(.fund-shots__thumb img)")].filter((img) => {
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
    /* Секции названы вкладками, а не заголовками: пара «заголовок плюс
       вкладки» давала повтор. Сами заголовки остались скрытыми, для читалки
       и оглавления документа. */
    for (const heading of ["Подробности сбора", "Поддержать сбор", "Другие сборы"]) {
      assert.ok(
        shape.headings.some((item) => item.replace(/\s+/g, " ").includes(heading)),
        `${viewport.name}: нет заголовка «${heading}»: ${shape.headings.join(" | ")}`,
      );
    }
    assert.deepEqual(
      shape.tabs,
      ["О сборе", "О фонде", "Сделать взнос", "Наши герои"],
      `${viewport.name}: вкладки не те: ${shape.tabs.join(" | ")}`,
    );
    assert.ok(shape.shot, `${viewport.name}: кадра сбора нет вовсе`);
    assert.equal(shape.shot.radius, viewport.width <= 1100 ? "24px" : "0px", `${viewport.name}: неверное скругление фотографий (${shape.shot.radius})`);
    /* Полноразмерная правая половина на десктопе, отступы на планшете/телефоне. */
    assert.ok(
      viewport.width > 1100 ? shape.shot.edge >= 0 && shape.shot.edge <= 20 : shape.shot.edge >= 12,
      `${viewport.name}: неверная правая граница снимка (${shape.shot.edge}px)`,
    );
    if (!compact) {
      assert.ok(
        shape.shot.wide >= Math.min(viewport.width * 0.3, 400),
        `${viewport.name}: полоса шириной ${shape.shot.wide}px при окне ${viewport.width}`,
      );
    }
    assert.equal(shape.framed, 0, `${viewport.name}: на странице ${shape.framed} снимков в рамке`);
    assert.ok(shape.measure <= 78, `${viewport.name}: строка текста в ${shape.measure} знаков`);
    assert.ok(shape.overflow <= 1, `${viewport.name}: перелив по горизонтали ${shape.overflow}px`);
    assert.doesNotMatch(shape.emoji, EMOJI, `${viewport.name}: в тексте остались эмодзи вместо значков`);
    assert.equal(shape.dock, 0, `${viewport.name}: кнопка-догонялка висит с самого верха`);
    assert.equal(shape.bar, "36px", `${viewport.name}: шкала сбора высотой ${shape.bar}`);
    assert.equal(
      shape.shimmer,
      viewport.reducedMotion === "reduce" ? "none" : "fund-sheen",
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
        ".fund-money__sums small",
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

    /* Кадры листаются кнопками, счётчик идёт следом, и всё это работает с
       клавиатуры. */
    let picks = "кадр один";
    if ((await page.$$(".fund-shots__arrow")).length > 0) {
      const first = await page.$eval(".fund-shots__main .swiper-slide-active .fund-shots__img", (node) => node.currentSrc);
      await page.locator(".fund-shots__arrow--next").focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      const state = await page.evaluate(() => ({
        src: document.querySelector(".fund-shots__main .swiper-slide-active .fund-shots__img").currentSrc,
        count: document.querySelector(".fund-shots__count").textContent.replace(/\s+/g, " ").trim(),
      }));
      assert.notEqual(state.src, first, `${viewport.name}: кадр не сменился с клавиатуры`);
      assert.match(state.count, /^2 \/ \d+$/, `${viewport.name}: счётчик кадров показывает «${state.count}»`);
      picks = `кадры листаются кнопками (${state.count})`;
    }

    /* Вкладки переключаются и панель под ними меняется. */
    const second = page.locator('[role="tab"]').nth(1);
    await second.click();
    await page.waitForTimeout(600);
    const switched = await page.evaluate(() => {
      const tab = document.querySelectorAll('[role="tab"]')[1];
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      return { selected: tab.getAttribute("aria-selected"), panel: Boolean(panel), text: panel?.innerText.slice(0, 40) ?? "" };
    });
    assert.equal(switched.selected, "true", `${viewport.name}: вторая вкладка не включилась`);
    assert.ok(switched.panel && switched.text.length > 10, `${viewport.name}: панель второй вкладки пуста`);

    /* Форма взноса стоит прямо на странице, с назначением этого сбора. */
    const inline = await page.evaluate(() => {
      const form = document.querySelector(".fund-form");
      return {
        есть: Boolean(form),
        ступени: form ? form.querySelectorAll(".donation-tier").length : 0,
        поля: Boolean(form?.querySelector(".donation-fields")),
        назначение: form?.querySelector(".camp-form__intent strong")?.textContent.trim() ?? "",
      };
    });
    assert.ok(inline.есть, `${viewport.name}: формы взноса на странице нет`);
    assert.ok(inline.ступени >= 5, `${viewport.name}: ступеней в форме ${inline.ступени}`);
    assert.ok(inline.поля, `${viewport.name}: полей в форме нет`);
    assert.equal(inline.назначение, shape.title, `${viewport.name}: в форме не тот сбор: «${inline.назначение}»`);

    await page.getByRole("tab", { name: "Сделать взнос", exact: true }).click();
    await page.locator(".fund-form").getByRole("textbox", { name: "Имя", exact: true }).fill("Проверка");
    await page.getByRole("tab", { name: "Наши герои", exact: true }).click();
    await page.getByRole("tab", { name: "Сделать взнос", exact: true }).click();
    assert.equal(await page.locator(".fund-form").getByRole("textbox", { name: "Имя", exact: true }).inputValue(), "Проверка", `${viewport.name}: вкладки сбросили форму`);

    /* Кнопка-догонялка появляется, когда кнопка обложки ушла вверх, и только
       на узком экране. Прыжок в конец страницы её тоже включает: наблюдатель
       пересечения такой прыжок проходил молча.

       Проверяется до окна помощи: закрытое окно возвращает фокус кнопке
       обложки, и страница сама уезжает обратно к ней. */
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(700);
    /* Считаются видимые по display: на широком экране узел остаётся в
       разметке и спрятан правилом. Проверять offsetParent тут нельзя: у
       закреплённого элемента он null всегда. */
    const dockAtEnd = await page.$$eval(".fund-dock", (nodes) =>
      nodes.filter((node) => getComputedStyle(node).display !== "none").length,
    );
    assert.equal(dockAtEnd, compact ? 1 : 0, `${viewport.name}: внизу страницы кнопок-догонялок ${dockAtEnd}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    /* Кнопка обложки возвращает к встроенной форме, в том числе из героев. */
    await page.getByRole("tab", { name: "Наши герои", exact: true }).click();
    const heroesHeight = await page.locator("#fund-contribution .fund-switch__stage").evaluate(node => node.getBoundingClientRect().height);
    await page.locator(".fund-cover__actions .camp-btn, .camp-blank .camp-btn").first().click();
    await page.waitForTimeout(1100);
    assert.equal(await page.getByRole("tab", { name: "Сделать взнос", exact: true }).getAttribute("aria-selected"), "true", `${viewport.name}: кнопка не открыла вкладку формы`);
    assert.equal(await page.locator(".camp-donate").count(), 0, `${viewport.name}: вместо прокрутки открылось окно`);
    const contribution = await page.locator("#fund-contribution").evaluate(node => ({top: node.getBoundingClientRect().top, height: node.querySelector(".fund-switch__stage").getBoundingClientRect().height}));
    assert.ok(contribution.top >= 0 && contribution.top <= 80, `${viewport.name}: форма не прокручена к началу экрана (${contribution.top})`);
    assert.ok(Math.abs(contribution.height - heroesHeight) <= 1, `${viewport.name}: высота героев отличается от формы`);
    assert.equal(await page.locator(".fund-form").getByRole("textbox", { name: "Имя", exact: true }).inputValue(), "Проверка", `${viewport.name}: кнопка помощи сбросила форму`);

    assert.deepEqual(noise, [], `${viewport.name}: ошибки в консоли: ${noise.join(" | ")}`);

    console.log(
      `${viewport.name.padEnd(15)} поля по ряду, полоса ${shape.shot.wide}×${shape.shot.tall}px, строка ${shape.measure} знаков, ${picks}, прокрутка к форме, догонялка внизу ${dockAtEnd}`,
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

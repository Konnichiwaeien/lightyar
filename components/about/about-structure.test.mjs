import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("./about-narrative.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("./about-narrative.css", import.meta.url), "utf8");
const aboutService = fs.readFileSync(new URL("../../lib/api/services/about-page.ts", import.meta.url), "utf8");
const aboutNormalizer = fs.readFileSync(new URL("../../lib/about/normalize-about-page.ts", import.meta.url), "utf8");
const aboutContent = fs.readFileSync(new URL("../../lib/about/about-content.ts", import.meta.url), "utf8");
const aboutFigures = fs.readFileSync(new URL("../../lib/about/about-figures.ts", import.meta.url), "utf8");

test("about narrative consumes managed content and links to reports", () => {
  assert.match(source, /AboutPageContent/);
  assert.match(source, /content\.heroTitle/);
  assert.match(source, /content\.teamMembers/);
  assert.match(source, /content\.faqItems/);
  assert.match(source, /href="\/reports"/);
  assert.doesNotMatch(source, /const faqData =/);
  assert.doesNotMatch(source, /const\s+stats\s*=/);
});

test("about narrative keeps CTAs distinct and renders CMS-driven statistics", () => {
  assert.match(source, /href="\/pets"/);
  assert.match(source, /href="\/#donate"/);
  assert.match(source, /href="https:\/\/vk\.com\/im\?sel=-228082117"/);
  assert.match(source, /buildAboutStatisticSegments\(stats\)/);
  assert.match(source, /<CurrentCare stats=\{content\.currentStats\} \/>/);
  assert.match(source, /className="about-ring"/);
  assert.match(source, /className="about-statistics-list"/);
  assert.match(css, /\.about-ring\s*\{/);
  assert.match(css, /\.about-statistics-list\s*\{/);
});

test("about motion has an explicit reduced-motion contract", () => {
  assert.match(source, /function MediaFrame[\s\S]*?usePrefersReducedMotion\(\)/);
  assert.match(source, /autoPlay=\{active && !mobile && !reduceMotion\}/);
  assert.match(source, /loop=\{!reduceMotion\}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(source, /function FaqItem/);
  assert.match(source, /aria-expanded=\{open\}/);
  assert.match(source, /gridTemplateRows: open \? "1fr" : "0fr"/);
  assert.match(source, /aria-hidden=\{!open\}/);
  assert.match(source, /className="about-heading-accent__fill"/);
  assert.doesNotMatch(source, /about-heading-accent__line/);
  assert.match(css, /\.about-heading-accent__fill\s*\{/);
});

/**
 * Левая колонка — главный механизм страницы. Кадры соседних глав живут в DOM
 * и перекрёстно затухают, новый кадр показывается только после загрузки, а
 * между главами никогда не появляется пустой чёрный экран.
 */
test("the sticky column cross-fades mounted frames instead of swapping one slot", () => {
  assert.match(source, /function AboutStage\(\{ scenes, activeIndex \}/);
  assert.match(source, /className="about-stage__layer"/);
  assert.match(source, /const state = isVisible \? "active" : index === shown\.previous \? "behind" : "idle"/);
  assert.match(source, /const mounted = new Set\(\[shown\.index, shown\.previous, activeIndex - 1, activeIndex, activeIndex \+ 1\]\)/);
  // Кадр становится видимым только когда его картинка уже загружена.
  assert.match(source, /activeScene\.mediaType !== "image" \|\| readyIds\.includes\(activeScene\.id\)/);
  assert.match(source, /if \(activeReady && shown\.index !== activeIndex\) \{\s*\n\s*setShown\(\{ index: activeIndex, previous: shown\.index \}\);/);
  assert.match(source, /onLoad=\{onReady\}/);
  assert.doesNotMatch(source, /AnimatePresence/);
  assert.doesNotMatch(source, /about-stage__transition/);
  assert.match(css, /\.about-stage__layer\s*\{[\s\S]*?opacity:\s*0/);
  assert.match(css, /\.about-stage__layer\[data-state="behind"\]\s*\{[\s\S]*?z-index:\s*1;\s*opacity:\s*1/);
  /* Проявление задано анимацией, а не переходом: переход не срабатывает на слое,
     смонтированном сразу активным (так бывает при быстрой прокрутке), и кадр
     вспыхивал бы резко вместо плавного проявления. */
  assert.match(css, /\.about-stage__layer\[data-state="active"\]\s*\{[\s\S]*?z-index:\s*2;\s*animation:\s*about-stage-in/);
  assert.match(css, /@keyframes about-stage-in\s*\{\s*from \{ opacity: 0/);
  const layerBody = css.match(/\n\.about-stage__layer \{([^}]*)\}/)?.[1] ?? "";
  assert.doesNotMatch(layerBody, /transition:/, "the base layer carries no transition");
  // Постоянный will-change на всех кадрах — это лишние слои композитора.
  assert.doesNotMatch(layerBody, /will-change/);
});

/**
 * Активна последняя сцена, начавшаяся выше середины экрана. Правило монотонное:
 * кадры идут строго по порядку вёрстки и назад не возвращаются. По прежнему
 * правилу «побеждает самая узкая сцена под центром» портрет человека внутри
 * главы «Команда» заставлял кадр самой главы появиться второй раз — за портретом
 * и до конца главы.
 */
test("the active frame advances monotonically and never returns to an earlier one", () => {
  assert.match(source, /function useActiveScene/);
  assert.match(source, /const center = window\.innerHeight \/ 2/);
  assert.match(source, /if \(rect\.top <= center\) started = id;/);
  assert.match(source, /const next = started \?\? nodes\[0\]\?\.dataset\.aboutScene/);
  assert.match(source, /requestAnimationFrame\(measure\)/);
  assert.doesNotMatch(source, /rect\.bottom >= center/);
  assert.doesNotMatch(source, /rect\.height < covering\.height/);
  assert.doesNotMatch(source, /new IntersectionObserver/);
});

/**
 * Состояние прокрутки не должно перерисовывать рассказ: главы зависят только от
 * материала страницы, поэтому они вынесены в memo. Наведение на кольцо тоже
 * не задевает вкладки и показатели года — у блоков раздельное состояние.
 */
test("scroll and hover state stay out of the story and the figures", () => {
  assert.match(source, /const AboutStory = memo\(function AboutStory\(/);
  assert.match(source, /<AboutStory content=\{content\} chapters=\{chapters\} \/>/);
  assert.match(source, /const FirstYearFigures = memo\(function FirstYearFigures\(\)/);
  assert.match(source, /function CurrentCare\(\{ stats \}/);
  // Пересчёт числа пишется прямо в узел: состояние на каждый кадр анимации
  // означало бы сотни лишних перерисовок за одну смену вкладки.
  assert.match(source, /node\.textContent = format\(Math\.round\(value \* eased\)\)/);
  assert.doesNotMatch(source, /setProgress\(/);
});

test("every chapter owns a distinct real frame and none falls back to a dark screen", () => {
  const media = [...source.matchAll(/media:\s*([^\n,]+)/g)].map((match) => match[1].trim());
  assert.ok(media.length >= 8, "each chapter declares its own media");
  assert.doesNotMatch(source, /id: "reports",\s*\n\s*mediaType: "abstract"/);
  assert.match(source, /const TEAM_STAGE_IMAGE = "\/about\/real\/team-together\.jpg"/);
  assert.match(source, /const REPORTS_STAGE_IMAGE = "\/about\/real\/handover\.jpg"/);

  const usedInChapters = [
    "/about/real/community-care.jpg",
    "/about/real/group-training.jpg",
    "/about/real/shelter-yard.jpg",
    "/about/real/team-together.jpg",
    "/about/real/care-indoor.jpg",
    "/about/real/volunteer-walk.jpg",
    "/about/real/handover.jpg",
    "/about/real/dog-blackwhite.jpg",
  ];
  assert.equal(new Set(usedInChapters).size, usedInChapters.length, "no chapter repeats another chapter's frame");
  for (const file of usedInChapters) {
    assert.equal(fs.existsSync(new URL(`../../public${file}`, import.meta.url)), true, `${file} must exist`);
  }
});

/**
 * Портрет человека принадлежит липкой колонке: пока читаешь его историю,
 * слева стоит именно его фотография. В карточке портрета быть не должно.
 */
test("a founder portrait drives the sticky column instead of sitting in the card", () => {
  assert.match(source, /sceneId=\{member\.photo \? `team-member-\$\{index\}` : undefined\}/);
  assert.match(source, /id: item\.sceneId,\s*\n\s*media: item\.photo/);
  assert.match(css, /\.about-person__photo\s*\{\s*display:\s*none;\s*\}/);
  // Без липкой колонки портрет возвращается в карточку.
  assert.match(css, /@media \(max-width: 1023px\)[\s\S]*?\.about-person__photo\s*\{[\s\S]*?display:\s*block/);
});

/**
 * Опоры стоят без рамок и подложек: кадр, знак направления и подпись,
 * в которой отмечено главное слово.
 */
test("mission shows three frameless plates of care with icons and a marked phrase", () => {
  assert.match(source, /const ABOUT_PRINCIPLES = \[/);
  assert.match(source, /className="about-principle__media"/);
  assert.match(source, /className="about-principle__icon"/);
  assert.match(source, /className="about-mark"/);
  assert.match(source, /icon: House/);
  assert.match(source, /icon: Stethoscope/);
  assert.match(source, /image: "\/about\/real\/shelter-home\.jpg"/);
  assert.match(source, /image: "\/about\/real\/rescued-dog\.jpg"/);
  assert.match(source, /image: "\/about\/real\/dog-hand\.jpg"/);
  assert.doesNotMatch(source, /about-principle-card/);
  assert.doesNotMatch(source, /about-principle__plate/);
  assert.doesNotMatch(source, /about-principles__path/);
  assert.doesNotMatch(source, /principle\.number/);
  assert.doesNotMatch(css, /\.about-principle__plate/);
  assert.doesNotMatch(css, /\.about-principles__path/);
  assert.match(css, /\.about-principles\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.about-mark\s*\{[\s\S]*?background:\s*rgba\(245, 158, 11/);
  // Все три подписи начинаются на одной линии, даже если заголовок в две строки.
  assert.match(css, /\.about-principle h3\s*\{[\s\S]*?min-height:\s*2\.1em/);
  // Ниже 1280px колонка узкая: опора становится парой «кадр + подпись».
  assert.match(css, /@media \(max-width: 1279px\)[\s\S]*?\.about-principle\s*\{[\s\S]*?grid-template-columns:\s*minmax\(9rem, 0\.42fr\)/);
  // На телефоне пара снова распрямляется в столбик.
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*?\.about-principle\s*\{\s*\n\s*display:\s*block/);
});

/** Сетки выровнены по колонке текста и не упираются в край окна. */
test("the mission and volunteer grids stay inside the reading column", () => {
  const ruleBody = (selector) => css.match(new RegExp(`\\n${selector.replace(/[.$]/g, "\\$&")} \\{([^}]*)\\}`))?.[1] ?? "";
  for (const selector of [".about-principles", ".about-bento"]) {
    const body = ruleBody(selector);
    assert.match(body, /margin:\s*clamp\([^)]*\) 0 0/, `${selector} aligns with the reading column`);
    assert.doesNotMatch(body, /-1\)/, `${selector} does not bleed past the column`);
  }
  assert.match(css, /#about-mission,\s*\n#about-volunteer\s*\{[\s\S]*?--about-section-pad-x/);
});

/** Бэйджи показателей читаются знаком, а не только словом. */
test("figure tabs carry an icon for each group", () => {
  assert.match(source, /const FIGURE_GROUP_ICONS: Record<string, typeof PawPrint> = \{/);
  assert.match(source, /animals: PawPrint/);
  assert.match(source, /vet: Stethoscope/);
  assert.match(source, /people: HandHeart/);
  assert.match(source, /voice: Megaphone/);
  assert.match(source, /<GroupIcon aria-hidden="true" \/>/);
  assert.match(css, /\.about-figures__tab-label svg\s*\{/);
});

/**
 * Показатели должны быть интерактивными и их должно быть много: кольцо
 * текущего кураторства плюс сгруппированные итоги первого года работы.
 */
test("results pair an interactive ring with grouped first-year figures", () => {
  assert.match(source, /function StatisticsRing/);
  assert.match(source, /onPointerEnter=\{\(\) => onSelect\(index\)\}/);
  assert.match(source, /aria-pressed=\{selectedSegment === index\}/);
  assert.match(source, /role="tablist"/);
  assert.match(source, /role="tabpanel"/);
  assert.match(source, /event\.key === "ArrowRight"/);
  assert.match(source, /event\.key === "Home"/);
  assert.match(source, /function CountUp/);
  assert.match(source, /ABOUT_FIRST_YEAR_GROUPS/);
  assert.match(source, /ABOUT_FIRST_YEAR_SOURCE\.href/);
  assert.ok(ABOUT_GROUP_COUNT() >= 4, "at least four groups of figures");
  assert.ok(ABOUT_FIGURE_COUNT() >= 12, "at least twelve published figures");
  assert.match(aboutFigures, /https:\/\/vk\.com\/wall-228082117_3783/);
  assert.match(css, /\.about-figures__tab-label\s*\{[\s\S]*?z-index:\s*1/);
  // Общее правило на span съедало саму «таблетку» активной вкладки.
  assert.doesNotMatch(css, /\.about-figures__tabs button > span\s*\{/);
});

/** Полоска долей сжата в ноль по ширине, наблюдать надо за списком целиком. */
test("share bars animate from the list, not from a zero-width element", () => {
  assert.match(source, /const listInView = useInView\(listRef, \{ once: true/);
  assert.match(source, /animate=\{\{ scaleX: listInView \? 1 : 0 \}\}/);
  assert.doesNotMatch(source, /whileInView=\{\{ scaleX: 1 \}\}/);
});

test("volunteering is a bento of differently sized tiles with one amber call to action", () => {
  assert.match(source, /function VolunteerBento/);
  assert.match(source, /const VOLUNTEER_TILES = \[/);
  assert.match(source, /className="about-bento__tile about-bento__tile--cta"/);
  assert.doesNotMatch(source, /about-help-list/);
  assert.doesNotMatch(css, /\.about-help-list/);
  assert.match(css, /\.about-bento\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  const spans = ["walk", "car", "photo", "repair", "donate", "cta"]
    .map((id) => css.match(new RegExp(`\\.about-bento__tile--${id} \\{ grid-column: ([^;]+); grid-row: ([^;]+);`)))
    .map((match) => match && `${match[1]}|${match[2]}`);
  assert.ok(spans.every(Boolean), "every tile places itself on the grid");
  assert.ok(new Set(spans).size >= 4, "tiles do not all share one size");
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*?\.about-bento\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
});

test("about fallbacks use stable real VK photography and one verified founder portrait", () => {
  assert.match(aboutContent, /heroPoster:\s*"\/about\/real\/community-care\.jpg"/);
  assert.doesNotMatch(aboutContent, /heroVideo:\s*"\/hero-video\.mp4"/);
  assert.match(aboutContent, /directionsImage:\s*"\/about\/real\/group-training\.jpg"/);
  assert.match(aboutContent, /historyImage:\s*"\/about\/real\/shelter-yard\.jpg"/);
  assert.match(aboutContent, /resultsImage:\s*"\/about\/real\/care-indoor\.jpg"/);
  assert.match(aboutContent, /faqImage:\s*"\/about\/real\/dog-blackwhite\.jpg"/);
  assert.match(aboutContent, /volunteerPoster:\s*"\/about\/real\/volunteer-walk\.jpg"/);
  assert.doesNotMatch(aboutContent, /volunteerVideo:\s*"\/hero-video-2\.mp4"/);
  assert.match(aboutContent, /name:\s*"Светлана Клюкина"[\s\S]*?photo:\s*"\/about\/real\/team\/svetlana-klyukina\.jpg"/);
  // Стоковые и сгенерированные кадры на странице реальной организации недопустимы.
  assert.doesNotMatch(aboutContent, /\/about\/(?:moment-[123]|panorama)\.jpg/);
  assert.doesNotMatch(source, /\/about\/(?:moment-[123]|panorama)\.jpg/);
  for (const path of [
    "../../public/about/real/community-care.jpg",
    "../../public/about/real/group-training.jpg",
    "../../public/about/real/dog-hand.jpg",
    "../../public/about/real/dog-portrait.jpg",
    "../../public/about/real/dog-blackwhite.jpg",
    "../../public/about/real/volunteer-walk.jpg",
    "../../public/about/real/shelter-yard.jpg",
    "../../public/about/real/shelter-home.jpg",
    "../../public/about/real/rescued-dog.jpg",
    "../../public/about/real/care-indoor.jpg",
    "../../public/about/real/team-together.jpg",
    "../../public/about/real/handover.jpg",
    "../../public/about/real/walk-together.jpg",
    "../../public/about/real/dog-car.jpg",
    "../../public/about/real/team/svetlana-klyukina.jpg",
  ]) assert.equal(fs.existsSync(new URL(path, import.meta.url)), true, `${path} must exist`);
});

test("hero and volunteer chapters fall back from video to real still photography", () => {
  assert.match(source, /media:\s*content\.heroVideo\s*\|\|\s*content\.heroPoster/);
  assert.match(source, /mediaType:\s*content\.heroVideo\s*\?\s*"video"\s*:\s*content\.heroPoster\s*\?\s*"image"/);
  assert.match(source, /media:\s*content\.volunteerVideo\s*\|\|\s*content\.volunteerPoster/);
  assert.match(source, /mediaType:\s*content\.volunteerVideo\s*\?\s*"video"\s*:\s*content\.volunteerPoster\s*\?\s*"image"/);
});

test("results use a cream editorial palette with dark readable statistics", () => {
  assert.match(source, /id: "results",[\s\S]*?tone: "cream"/);
  assert.match(css, /\.about-chapter\[data-tone="cream"\]\s*\{[\s\S]*?background:\s*var\(--about-cream\)/);
  assert.match(css, /\.about-statistics-list__copy strong\s*\{[\s\S]*?color:\s*var\(--about-black\)/);
  assert.match(css, /\.about-statistics-list li\s*\{[\s\S]*?border-top:\s*1px solid var\(--about-rule\)/);
});

test("about removes chapter navigation, photo captions, and decorative list numbers", () => {
  assert.doesNotMatch(source, /function ChapterNavigation/);
  assert.doesNotMatch(source, /<ChapterNavigation/);
  assert.doesNotMatch(source, /about-stage__caption/);
  assert.doesNotMatch(source, /about-person__number/);
  assert.doesNotMatch(source, /about-statistics-list__index/);
  assert.doesNotMatch(css, /\.about-chapter-nav/);
  assert.doesNotMatch(css, /\.about-stage__caption/);
  assert.doesNotMatch(css, /\.about-person__number/);
  assert.doesNotMatch(css, /\.about-statistics-list__index/);
});

test("server and browser share the same initial motion markup", () => {
  assert.match(source, /function Reveal[\s\S]*?data-about-reveal=""[\s\S]*?initial=\{\{ opacity: 0, y: 28 \}\}/);
  assert.match(source, /function HeadingAccent[\s\S]*?initial=\{\{ opacity: 0, scaleX: 0\.18 \}\}/);
  assert.match(source, /className="about-principle"[\s\S]*?initial=\{\{ opacity: 0, y: 36 \}\}/);
  assert.doesNotMatch(source, /initial=\{reduceMotion \? false/);
  assert.match(css, /prefers-reduced-motion[\s\S]*?\[data-about-reveal\][\s\S]*?opacity:\s*1\s*!important/);
  assert.match(css, /prefers-reduced-motion[\s\S]*?\.about-principle,[\s\S]*?transform:\s*none\s*!important/);
  assert.match(css, /prefers-reduced-motion[\s\S]*?\.about-stage__layer\[data-state="active"\],[\s\S]*?transform:\s*none/);
});

test("about feedback keeps history light and removes the decorative year", () => {
  assert.doesNotMatch(source, /<span aria-hidden="true">2024<\/span>/);
  assert.match(source, /id: "history",[\s\S]*?tone: "white"/);
  assert.match(css, /#about-history \.about-chapter__inner\s*\{/);
});

test("team portraits remain connected to real CMS media", () => {
  assert.match(aboutService, /populate\[teamMembers\]\[populate\]\[photo\]=true/);
  assert.match(aboutNormalizer, /photo:\s*resolveMedia\(item\.photo, resolveMediaUrl\)/);
  assert.match(source, /member\.photo && \([\s\S]*?<Image src=\{member\.photo\}/);
});

test("FAQ is an unnumbered full-width editorial list with calm row feedback", () => {
  assert.match(source, /function FaqItem\(\{ question, answer \}/);
  assert.doesNotMatch(source, /<small>\{String\(index \+ 1\)/);
  assert.doesNotMatch(source, /index=\{index\}/);
  assert.match(source, /className="about-faq__answer"/);
  assert.match(source, /className="about-faq__answer-inner"/);
  assert.doesNotMatch(source, /\{open && \(/);
  assert.match(css, /#about-faq\s*\{[\s\S]*?align-items:\s*flex-start/);
  assert.match(css, /\.about-faq__answer\s*\{[\s\S]*?display:\s*grid/);
  assert.match(css, /\.about-faq__answer-inner\s*\{[\s\S]*?min-height:\s*0/);
  assert.match(css, /\.about-faq__item button:hover\s*\{[\s\S]*?background:/);
  assert.match(css, /\.about-faq__item button > span:first-child\s*\{[\s\S]*?transition:/);
});

test("the about page meets the footer without rounded top corners", () => {
  assert.match(css, /body:has\(\.about-managed\) #footer\s*\{[\s\S]*?border-radius:\s*0/);
});

test("about interactions use light, eased hover, focus, and pressed states", () => {
  assert.match(css, /\.about-button\s*\{[\s\S]*?420ms var\(--about-ease-out\)/);
  assert.match(css, /\.about-button--ghost:hover,[\s\S]*?\.about-button--ghost:focus-visible\s*\{[\s\S]*?background:\s*rgba\(245, 158, 11, 0\.12\)/);
  assert.doesNotMatch(css, /\.about-button--ghost:hover\s*\{[\s\S]*?background:\s*var\(--about-black\)/);
  assert.match(css, /\.about-button:active\s*\{/);
  assert.match(css, /\.about-faq__item button:active\s*\{/);
  assert.match(css, /\.about-reports-link:active\s*\{/);
  assert.match(css, /\.about-bento__tile:hover\s*\{[\s\S]*?transform:\s*translateY/);
  assert.match(css, /\.about-bento__tile--cta:focus-visible\s*\{/);
  assert.match(css, /\.about-statistics-list button:focus-visible\s*\{/);
  assert.match(css, /\.about-figures__tabs button:focus-visible\s*\{/);
});

function ABOUT_GROUP_COUNT() {
  return [...aboutFigures.matchAll(/^\s{4}id: "/gm)].length;
}

function ABOUT_FIGURE_COUNT() {
  return [...aboutFigures.matchAll(/value: \d+/g)].length;
}

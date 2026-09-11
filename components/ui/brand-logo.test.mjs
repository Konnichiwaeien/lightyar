import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const readIfPresent = (path) => {
  try {
    return read(path);
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
};

const logo = readIfPresent("./brand-logo.tsx");
const homeHeader = read("../home/home-header.tsx");
const innerHeader = read("../layout/inner-header.tsx");
const darkInnerHeader = read("../layout/dark-inner-header.tsx");
const menuOverlay = read("../layout/menu-overlay.tsx");
const menuButton = read("./menu-button.tsx");
const footer = read("../sections/footer.tsx");

test("the brand logo stays in the menu overlay but not in navigation headers", () => {
  assert.match(logo, /from "next\/image"/);
  assert.match(logo, /src="\/logo\.png"/);
  assert.match(logo, /width=\{300\}/);
  assert.match(logo, /height=\{300\}/);
  assert.match(logo, /data-brand-logo/);

  for (const source of [homeHeader, innerHeader, darkInnerHeader]) {
    assert.doesNotMatch(source, /<BrandLogo/);
    assert.doesNotMatch(source, /aria-label="Главная страница приюта Светлый"/);
    assert.doesNotMatch(source, /<PawLogo/);
  }

  assert.match(menuOverlay, /<BrandLogo/);
});

test("navigation headers right-align an always-light menu button", () => {
  const headerClass = homeHeader.match(/<header className="([^"]+)"/)?.[1] ?? "";

  assert.match(headerClass, /justify-end/);
  assert.doesNotMatch(headerClass, /mix-blend-difference/);
  assert.doesNotMatch(homeHeader, /mix-blend-difference/);
  assert.match(homeHeader, /bg-\[#f7f3eb\]/);
  assert.match(homeHeader, /text-\[#1c1c1c\]/);

  for (const source of [innerHeader, darkInnerHeader]) {
    assert.match(source, /justify-end/);
  }

  assert.match(menuButton, /bg-\[#f7f3eb\]/);
  assert.match(menuButton, /text-\[#1c1c1c\]/);
});

test("menu button has eased pointer, keyboard, and pressed feedback", () => {
  assert.match(menuButton, /\bgroup\b/);
  assert.match(menuButton, /duration-500/);
  assert.match(menuButton, /ease-\[cubic-bezier\(0\.16,1,0\.3,1\)\]/);
  // Нажатие опускает кнопку на место, а не сжимает её в поднятом состоянии.
  assert.match(menuButton, /active:translate-y-0 active:scale-\[0\.97\] active:duration-150/);
  assert.doesNotMatch(menuButton, /active:scale-\[0\.96\]/);
  assert.match(menuButton, /group-hover:rotate-\[4deg\]/);
  assert.match(menuButton, /group-focus-visible:scale-\[1\.08\]/);
  assert.match(menuButton, /motion-reduce:transition-none/);
});

test("menu overlay and footer controls keep interaction feedback light and gradual", () => {
  assert.doesNotMatch(menuOverlay, /hover:bg-\[#1c1c1c\]/);
  assert.doesNotMatch(menuOverlay, /hover:text-white/);
  // Подложка осталась только у круглых кнопок оверлея; у пунктов навигации
  // её нет — строчная плашка во всю ширину читалась как кнопка.
  assert.match(menuOverlay, /hover:bg-amber-50/);
  assert.match(menuOverlay, /focus-visible:bg-amber-50/);
  assert.doesNotMatch(menuOverlay, /hover:bg-amber-50\/70/);
  assert.match(menuOverlay, /active:translate-y-0 active:scale-\[0\.97\] active:duration-150/);
  assert.match(menuOverlay, /duration-500/);
  assert.match(menuOverlay, /motion-reduce:transition-none/);

  // Наведение на пункт: цвет и стрелка за 300 мс, полсекунды ощущались вязко.
  assert.match(menuOverlay, /group-hover:text-\[#d97706\][\s\S]{0,400}duration-300|duration-300[\s\S]{0,400}group-hover:text-\[#d97706\]/);
  assert.match(menuOverlay, /absolute left-full/);
  // Маска выезда не должна срезать стрелку правее подписи.
  assert.match(menuOverlay, /className="overflow-hidden px-14"/);

  assert.match(footer, /hover:bg-amber-50/);
  assert.match(footer, /focus-visible:bg-amber-50/);
  assert.match(footer, /active:scale-\[0\.98\]/);
  assert.match(footer, /duration-500/);
  assert.match(footer, /motion-reduce:transition-none/);
});

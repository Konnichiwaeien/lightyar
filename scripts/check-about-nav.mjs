import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome" });
for (const [label, w, h] of [["мобильный", 390, 844], ["десктоп", 1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/about", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1800);
  const r = await page.evaluate(() => {
    const nav = document.querySelector(".about-chapter-nav");
    if (!nav) return null;
    const b = nav.getBoundingClientRect();
    const cs = getComputedStyle(nav);
    const active = nav.querySelector('[aria-current="location"]');
    const inactive = [...nav.querySelectorAll("button")].find((x) => !x.hasAttribute("aria-current"));
    const btn = nav.querySelector("button");
    return {
      слева: Math.round(b.left), справа: Math.round(window.innerWidth - b.right),
      ширина: Math.round(b.width),
      фонРейки: cs.backgroundColor,
      активныйФон: active ? getComputedStyle(active).backgroundColor : "нет активного",
      активныйЦвет: active ? getComputedStyle(active).color : "-",
      неактивныйЦвет: inactive ? getComputedStyle(inactive).color : "-",
      подписьВидна: btn ? getComputedStyle(btn.querySelector("span:last-child")).display : "-",
      кнопка: btn ? Math.round(btn.getBoundingClientRect().height) : 0,
    };
  });
  console.log(`${label} ${w}px:`, JSON.stringify(r, null, 1));
  await ctx.close();
}
await browser.close();
